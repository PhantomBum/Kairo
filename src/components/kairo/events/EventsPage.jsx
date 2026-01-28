import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Calendar, Clock, Users, MapPin, Plus, Bell, BellOff,
  Video, Mic, Globe, ChevronRight, Star, Check, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const eventTypes = [
  { id: 'voice', name: 'Voice Event', icon: Mic, color: 'text-emerald-400' },
  { id: 'stage', name: 'Stage Event', icon: Video, color: 'text-purple-400' },
  { id: 'external', name: 'External Event', icon: Globe, color: 'text-blue-400' },
];

function EventCard({ event, onInterested, onJoin, isInterested, currentUser }) {
  const isActive = event.status === 'active';
  const isUpcoming = event.status === 'scheduled' && isAfter(new Date(event.start_time), new Date());
  const isPast = event.status === 'completed' || isBefore(new Date(event.end_time || event.start_time), new Date());
  
  const EventIcon = eventTypes.find(t => t.id === event.type)?.icon || Calendar;
  const iconColor = eventTypes.find(t => t.id === event.type)?.color || 'text-zinc-400';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "bg-zinc-800/30 rounded-xl overflow-hidden border transition-all",
        isActive ? "border-emerald-500/50" : "border-zinc-800 hover:border-zinc-700",
        isPast && "opacity-60"
      )}
    >
      {/* Cover image */}
      <div 
        className="h-32 relative"
        style={{
          background: event.cover_image 
            ? `url(${event.cover_image}) center/cover`
            : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/90 to-transparent" />
        
        {/* Status badge */}
        {isActive && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-500 rounded-full text-xs font-medium text-white flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live Now
          </div>
        )}

        {/* Event type icon */}
        <div className={cn("absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/50 flex items-center justify-center", iconColor)}>
          <EventIcon className="w-4 h-4" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-lg mb-2 line-clamp-1">{event.name}</h3>
        
        {event.description && (
          <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{event.description}</p>
        )}

        {/* Event details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(event.start_time), 'MMM d, yyyy • h:mm a')}</span>
          </div>
          
          {event.external_location && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{event.external_location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Users className="w-4 h-4" />
            <span>{event.interested_count || 0} interested</span>
          </div>
        </div>

        {/* Host info */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-zinc-700" />
            <span className="text-sm text-zinc-400">Hosted by {event.host_name}</span>
          </div>

          {isActive ? (
            <Button size="sm" onClick={() => onJoin?.(event)} className="bg-emerald-500 hover:bg-emerald-600">
              Join
            </Button>
          ) : isUpcoming ? (
            <Button
              size="sm"
              variant={isInterested ? "secondary" : "default"}
              onClick={() => onInterested?.(event)}
              className={isInterested ? "bg-zinc-700" : "bg-indigo-500 hover:bg-indigo-600"}
            >
              {isInterested ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Interested
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-1" />
                  Interested
                </>
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

function CreateEventModal({ isOpen, onClose, onCreate, serverId, channels = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'voice',
    channel_id: '',
    start_time: '',
    end_time: '',
    external_location: ''
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.start_time) return;
    onCreate?.(formData);
    onClose();
  };

  if (!isOpen) return null;

  const voiceChannels = channels.filter(c => c.type === 'voice' || c.type === 'stage');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg mx-4 bg-[#121214] rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Create Event</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Event type */}
            <div className="space-y-2">
              <Label className="text-zinc-400">Event Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {eventTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFormData({ ...formData, type: type.id })}
                    className={cn(
                      "p-3 rounded-lg border-2 text-center transition-all",
                      formData.type === type.id
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-zinc-800 hover:border-zinc-700"
                    )}
                  >
                    <type.icon className={cn("w-5 h-5 mx-auto mb-1", type.color)} />
                    <span className="text-xs text-white">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label className="text-zinc-400">Event Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="What's the event about?"
                className="bg-zinc-900 border-zinc-800 text-white"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-zinc-400">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell people more about this event..."
                rows={3}
                className="bg-zinc-900 border-zinc-800 text-white resize-none"
              />
            </div>

            {/* Channel (for voice/stage events) */}
            {formData.type !== 'external' && (
              <div className="space-y-2">
                <Label className="text-zinc-400">Channel</Label>
                <Select
                  value={formData.channel_id}
                  onValueChange={(v) => setFormData({ ...formData, channel_id: v })}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue placeholder="Select a channel" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {voiceChannels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* External location (for external events) */}
            {formData.type === 'external' && (
              <div className="space-y-2">
                <Label className="text-zinc-400">Location / Link</Label>
                <Input
                  value={formData.external_location}
                  onChange={(e) => setFormData({ ...formData, external_location: e.target.value })}
                  placeholder="https://... or physical location"
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>
            )}

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Start Time</Label>
                <Input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400">End Time (Optional)</Label>
                <Input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="bg-zinc-900 border-zinc-800 text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.start_time}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              Create Event
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function EventsPage({ serverId, channels = [], currentUser }) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming' | 'active' | 'past'

  const { data: events = [] } = useQuery({
    queryKey: ['events', serverId],
    queryFn: () => base44.entities.Event.filter({ server_id: serverId }),
    enabled: !!serverId
  });

  const createEventMutation = useMutation({
    mutationFn: (eventData) => base44.entities.Event.create({
      ...eventData,
      server_id: serverId,
      host_id: currentUser?.id,
      host_name: currentUser?.full_name,
      status: 'scheduled'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', serverId] });
    }
  });

  const toggleInterestedMutation = useMutation({
    mutationFn: async (event) => {
      const isInterested = event.attendee_ids?.includes(currentUser?.id);
      const newAttendees = isInterested
        ? event.attendee_ids.filter(id => id !== currentUser?.id)
        : [...(event.attendee_ids || []), currentUser?.id];

      await base44.entities.Event.update(event.id, {
        attendee_ids: newAttendees,
        interested_count: newAttendees.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', serverId] });
    }
  });

  const filteredEvents = events.filter(event => {
    const now = new Date();
    const startTime = new Date(event.start_time);
    const endTime = event.end_time ? new Date(event.end_time) : addDays(startTime, 1);

    if (filter === 'active') return event.status === 'active';
    if (filter === 'upcoming') return event.status === 'scheduled' && isAfter(startTime, now);
    if (filter === 'past') return event.status === 'completed' || isBefore(endTime, now);
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#121214] overflow-hidden">
      {/* Header */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h2 className="font-semibold text-white">Events</h2>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-500 hover:bg-indigo-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 flex gap-2 border-b border-zinc-800/50">
        {['upcoming', 'active', 'past'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize",
              filter === f
                ? "bg-indigo-500/20 text-indigo-400"
                : "text-zinc-400 hover:bg-zinc-800"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Events grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                currentUser={currentUser}
                isInterested={event.attendee_ids?.includes(currentUser?.id)}
                onInterested={() => toggleInterestedMutation.mutate(event)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Calendar className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-zinc-400">No {filter} events</h3>
            <p className="text-sm">
              {filter === 'upcoming' ? 'Create an event to get started!' : 'Check back later'}
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <CreateEventModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={(data) => createEventMutation.mutate(data)}
            serverId={serverId}
            channels={channels}
          />
        )}
      </AnimatePresence>
    </div>
  );
}