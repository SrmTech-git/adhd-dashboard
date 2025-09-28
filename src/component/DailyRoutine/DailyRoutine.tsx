// src/components/DailyRoutine/DailyRoutine.tsx
'use client'
import React, { useState } from 'react';
import { CheckSquare, Square, Plus, X, RotateCcw, GripVertical } from 'lucide-react';
import { DailyRoutineItem } from '@/types/dashboard';
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

interface DailyRoutineProps {
  dailyRoutine: DailyRoutineItem[];
  setDailyRoutine: React.Dispatch<React.SetStateAction<DailyRoutineItem[]>>;
  currentTheme: any;
  isDarkMode: boolean;
}

interface SortableRoutineItemProps {
  task: DailyRoutineItem;
  toggleRoutineTask: (id: number) => void;
  removeRoutineItem: (id: number) => void;
  currentTheme: any;
}

const SortableRoutineItem: React.FC<SortableRoutineItemProps> = ({
  task,
  toggleRoutineTask,
  removeRoutineItem,
  currentTheme
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

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
      className="sortable-routine-item"
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem',
        borderRadius: '0.5rem',
        backgroundColor: isDragging ? currentTheme.border : 'transparent',
        transition: 'background-color 0.2s ease',
        border: isDragging ? `2px dashed ${currentTheme.primary}` : '2px solid transparent',
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
          onClick={() => toggleRoutineTask(task.id)}
          style={{
            background: 'none',
            border: 'none',
            color: task.completed ? currentTheme.success : currentTheme.textMuted,
            cursor: 'pointer',
            padding: 0
          }}
        >
          {task.completed ? <CheckSquare size={18} /> : <Square size={18} />}
        </button>
        <span style={{
          flex: 1,
          textDecoration: task.completed ? 'line-through' : 'none',
          color: task.completed ? currentTheme.textMuted : currentTheme.textPrimary
        }}>
          {task.text}
        </span>
        <button onClick={() => removeRoutineItem(task.id)} style={{
          background: 'none',
          border: 'none',
          color: currentTheme.textMuted,
          cursor: 'pointer',
          padding: '0.25rem',
          borderRadius: '0.25rem'
        }}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const DailyRoutine: React.FC<DailyRoutineProps> = ({
  dailyRoutine,
  setDailyRoutine,
  currentTheme,
  isDarkMode
}) => {
  const [newRoutineItem, setNewRoutineItem] = useState('');

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
      const oldIndex = dailyRoutine.findIndex((task) => task.id === active.id);
      const newIndex = dailyRoutine.findIndex((task) => task.id === over?.id);

      setDailyRoutine(arrayMove(dailyRoutine, oldIndex, newIndex));
    }
  };

  // Toggle daily routine task
  const toggleRoutineTask = (id: number) => {
    setDailyRoutine(dailyRoutine.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  // Add daily routine item
  const addRoutineItem = () => {
    if (newRoutineItem.trim()) {
      const newId = dailyRoutine.length > 0 ? Math.max(...dailyRoutine.map(t => t.id)) + 1 : 1;
      setDailyRoutine([...dailyRoutine, {
        id: newId,
        text: newRoutineItem,
        completed: false
      }]);
      setNewRoutineItem('');
    }
  };

  // Remove daily routine item
  const removeRoutineItem = (id: number) => {
    setDailyRoutine(dailyRoutine.filter(task => task.id !== id));
  };

  // Reset daily routine (would normally run at midnight)
  const resetDailyRoutine = () => {
    setDailyRoutine(dailyRoutine.map(task => ({ ...task, completed: false })));
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
        <CheckSquare size={20} />
        <h2 style={{ flex: 1, fontSize: '1.25rem', margin: 0 }}>Daily Routine</h2>
        <button onClick={resetDailyRoutine} style={{
          background: 'none',
          border: 'none',
          color: currentTheme.textSecondary,
          cursor: 'pointer',
          padding: '0.25rem',
          borderRadius: '0.25rem'
        }} title="Reset all to uncompleted">
          <RotateCcw size={16} />
        </button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={dailyRoutine.map(task => task.id)} strategy={verticalListSortingStrategy}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginBottom: '1rem',
            flex: 1,
            overflowY: 'auto',
            minHeight: 0 // Important for flex child scrolling
          }}>
            {dailyRoutine.map(task => (
              <SortableRoutineItem
                key={task.id}
                task={task}
                toggleRoutineTask={toggleRoutineTask}
                removeRoutineItem={removeRoutineItem}
                currentTheme={currentTheme}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Add daily routine item..."
          value={newRoutineItem}
          onChange={(e) => setNewRoutineItem(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addRoutineItem()}
          style={{
            flex: 1,
            padding: '0.5rem',
            border: `1px solid ${currentTheme.border}`,
            borderRadius: '0.5rem',
            outline: 'none',
            background: currentTheme.cardBackground,
            color: currentTheme.textPrimary
          }}
        />
        <button onClick={addRoutineItem} style={{
          padding: '0.5rem',
          background: currentTheme.primary,
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer'
        }}>
          <Plus size={20} />
        </button>
      </div>
      <div style={{
        height: '0.5rem',
        background: currentTheme.border,
        borderRadius: '0.25rem',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          background: currentTheme.success,
          width: dailyRoutine.length > 0 ? `${(dailyRoutine.filter(t => t.completed).length / dailyRoutine.length) * 100}%` : '0%',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </section>
  );
};

export default DailyRoutine;