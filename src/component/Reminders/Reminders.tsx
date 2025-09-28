import React, { useEffect } from 'react';
import { Bell, BellOff, Edit2, X, Save, Plus, GripVertical } from 'lucide-react';
import { Reminder } from '@/types/dashboard';
import { requestNotificationPermission } from '@/utils/notificationHelpers';
import { soundService, SoundType } from '@/lib/soundService';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RemindersProps {
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  currentTheme: any;
  isDarkMode: boolean;
  notificationPermission: NotificationPermission;
  setNotificationPermission: React.Dispatch<React.SetStateAction<NotificationPermission>>;
  newReminderText: string;
  setNewReminderText: React.Dispatch<React.SetStateAction<string>>;
  newReminderTime: string;
  setNewReminderTime: React.Dispatch<React.SetStateAction<string>>;
  newReminderFrequency: string;
  setNewReminderFrequency: React.Dispatch<React.SetStateAction<string>>;
  editingReminder: Reminder | null;
  setEditingReminder: React.Dispatch<React.SetStateAction<Reminder | null>>;
  saveReminder: () => void;
  startEditingReminder: (reminder: Reminder) => void;
  cancelEditingReminder: () => void;
  toggleReminder: (id: number) => void;
  removeReminder: (id: number) => void;
  formatReminderTime: (reminder: Reminder) => string;
  soundEnabled: boolean;
}

interface SortableReminderItemProps {
  reminder: Reminder;
  editingReminder: Reminder | null;
  currentTheme: any;
  formatReminderTime: (reminder: Reminder) => string;
  handleToggleReminder: (id: number) => void;
  handleRemoveReminder: (id: number) => void;
  startEditingReminder: (reminder: Reminder) => void;
}

const SortableReminderItem: React.FC<SortableReminderItemProps> = ({
  reminder,
  editingReminder,
  currentTheme,
  formatReminderTime,
  handleToggleReminder,
  handleRemoveReminder,
  startEditingReminder
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: reminder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="sortable-reminder-item"
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem',
        background: editingReminder?.id === reminder.id ? currentTheme.backgroundHover : currentTheme.backgroundMuted,
        borderRadius: '0.5rem',
        border: editingReminder?.id === reminder.id ? `1px solid ${currentTheme.primary}` : 'none',
        backgroundColor: isDragging ? currentTheme.border : (editingReminder?.id === reminder.id ? currentTheme.backgroundHover : currentTheme.backgroundMuted),
        transition: 'background-color 0.2s ease',
        boxShadow: isDragging ? `0 4px 12px rgba(0, 0, 0, 0.15)` : 'none',
      }}>
        <button
          {...listeners}
          style={{
            background: 'none',
            border: 'none',
            color: currentTheme.textMuted,
            cursor: 'grab',
            padding: '0.25rem',
            borderRadius: '0.25rem',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>
        <button
          onClick={() => handleToggleReminder(reminder.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            color: reminder.enabled ? currentTheme.primary : currentTheme.textMuted
          }}
          title={reminder.enabled ? 'Disable reminder' : 'Enable reminder'}
        >
          {reminder.enabled ? <Bell size={18} /> : <BellOff size={18} />}
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <span style={{
            color: reminder.enabled ? currentTheme.textPrimary : currentTheme.textMuted,
            textDecoration: reminder.enabled ? 'none' : 'line-through'
          }}>
            {reminder.text}
          </span>
          <span style={{ fontSize: '0.875rem', color: currentTheme.textSecondary }}>
            {formatReminderTime(reminder)}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={() => startEditingReminder(reminder)}
            style={{
              background: 'none',
              border: 'none',
              color: currentTheme.primary,
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.25rem'
            }}
            title="Edit reminder"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleRemoveReminder(reminder.id)}
            style={{
              background: 'none',
              border: 'none',
              color: currentTheme.textMuted,
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '0.25rem'
            }}
            title="Delete reminder"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Reminders: React.FC<RemindersProps> = ({
  reminders,
  setReminders,
  currentTheme,
  isDarkMode,
  notificationPermission,
  setNotificationPermission,
  newReminderText,
  setNewReminderText,
  newReminderTime,
  setNewReminderTime,
  newReminderFrequency,
  setNewReminderFrequency,
  editingReminder,
  saveReminder,
  startEditingReminder,
  cancelEditingReminder,
  toggleReminder,
  removeReminder,
  formatReminderTime,
  soundEnabled
}) => {
  // Initialize sound service
  useEffect(() => {
    soundService.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = reminders.findIndex((reminder) => reminder.id === active.id);
      const newIndex = reminders.findIndex((reminder) => reminder.id === over?.id);

      setReminders(arrayMove(reminders, oldIndex, newIndex));
    }
  };

  // Enhanced reminder handlers with sound feedback
  const handleSaveReminder = async () => {
    if (soundEnabled) {
      await soundService.play(SoundType.SUCCESS);
    }
    saveReminder();
  };

  const handleToggleReminder = async (id: number) => {
    const reminder = reminders.find(r => r.id === id);
    if (soundEnabled) {
      if (reminder?.enabled) {
        await soundService.play(SoundType.TIMER_PAUSE); // Pausing/disabling sound
      } else {
        await soundService.play(SoundType.TIMER_START); // Enabling sound
      }
    }
    toggleReminder(id);
  };

  const handleRemoveReminder = async (id: number) => {
    if (soundEnabled) {
      await soundService.play(SoundType.ERROR);
    }
    removeReminder(id);
  };
  return (
    <section style={{
      background: currentTheme.cardBackground,
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: isDarkMode ? '0 10px 30px rgba(0, 0, 0, 0.3)' : '0 10px 30px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '400px' // Fixed height
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        color: currentTheme.textPrimary
      }}>
        <Bell size={20} />
        <h2 style={{ flex: 1, fontSize: '1.25rem', margin: 0 }}>Gentle Reminders</h2>
        {notificationPermission === 'default' && (
          <button onClick={async () => {
            const permission = await requestNotificationPermission();
            setNotificationPermission(permission);
          }} style={{
            padding: '0.25rem 0.75rem',
            background: currentTheme.primary,
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.75rem'
          }}>
            Enable notifications
          </button>
        )}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={reminders.map(reminder => reminder.id)} strategy={verticalListSortingStrategy}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginBottom: '1rem',
            flex: 1,
            overflowY: 'auto',
            minHeight: 0 // Important for flex child scrolling
          }}>
            {reminders.map(reminder => (
              <SortableReminderItem
                key={reminder.id}
                reminder={reminder}
                editingReminder={editingReminder}
                currentTheme={currentTheme}
                formatReminderTime={formatReminderTime}
                handleToggleReminder={handleToggleReminder}
                handleRemoveReminder={handleRemoveReminder}
                startEditingReminder={startEditingReminder}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div style={{ borderTop: `1px solid ${currentTheme.border}`, paddingTop: '1rem' }}>
        <h4 style={{
          margin: '0 0 0.75rem 0',
          color: currentTheme.textPrimary,
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          {editingReminder ? 'Edit Reminder' : 'Add New Reminder'}
        </h4>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Reminder text..."
            value={newReminderText}
            onChange={(e) => setNewReminderText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSaveReminder()}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '0.5rem',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '0.5rem',
              outline: 'none',
              background: currentTheme.cardBackground,
              color: currentTheme.textPrimary
            }}
          />
          <select
            value={newReminderFrequency}
            onChange={(e) => setNewReminderFrequency(e.target.value)}
            style={{
              padding: '0.5rem',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '0.5rem',
              outline: 'none',
              background: currentTheme.cardBackground,
              color: currentTheme.textPrimary
            }}
          >
            <option value="once">Once</option>
            <option value="daily">Daily</option>
            <option value="interval-1">Every hour</option>
            <option value="interval-2">Every 2 hours</option>
            <option value="interval-3">Every 3 hours</option>
          </select>
          {(newReminderFrequency === 'once' || newReminderFrequency === 'daily') && (
            <input
              type="time"
              value={newReminderTime}
              onChange={(e) => setNewReminderTime(e.target.value)}
              style={{
                padding: '0.5rem',
                border: `1px solid ${currentTheme.border}`,
                borderRadius: '0.5rem',
                outline: 'none',
                background: currentTheme.cardBackground,
                color: currentTheme.textPrimary
              }}
            />
          )}
          <button onClick={handleSaveReminder} style={{
            padding: '0.5rem 1rem',
            background: currentTheme.primary,
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            {editingReminder ? (
              <>Update <Save size={16} /></>
            ) : (
              <>Add <Plus size={16} /></>
            )}
          </button>
          {editingReminder && (
            <button onClick={cancelEditingReminder} style={{
              padding: '0.5rem 1rem',
              background: currentTheme.backgroundMuted,
              color: currentTheme.textSecondary,
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Reminders;