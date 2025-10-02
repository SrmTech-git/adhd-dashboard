// src/components/RelationshipManager/RelationshipManager.tsx
'use client'
import React, { useState, useEffect } from 'react';
import { Users, UserPlus, MessageCircle, Trash2 } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  lastContactDate: string; // ISO string
}

interface RelationshipManagerProps {
  currentTheme: any;
  isDarkMode: boolean;
}

const RelationshipManager: React.FC<RelationshipManagerProps> = ({
  currentTheme,
  isDarkMode
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContactName, setNewContactName] = useState('');

  // Load contacts from localStorage on mount
  useEffect(() => {
    const savedContacts = localStorage.getItem('adhd-relationships');
    if (savedContacts) {
      try {
        setContacts(JSON.parse(savedContacts));
      } catch (error) {
        console.error('Failed to parse saved contacts:', error);
      }
    } else {
      // Add default test contact if no saved data exists
      const testContact: Contact = {
        id: 1,
        name: 'Alex Johnson',
        lastContactDate: '2024-09-20T14:30:00.000Z' // September 20, 2024
      };
      setContacts([testContact]);
    }
  }, []);

  // Save contacts to localStorage whenever contacts change
  useEffect(() => {
    localStorage.setItem('adhd-relationships', JSON.stringify(contacts));
  }, [contacts]);

  // Calculate days since last contact
  const getDaysSinceLastContact = (lastContactDate: string): number => {
    const lastContact = new Date(lastContactDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastContact.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get urgency color based on days since last contact
  const getUrgencyColor = (days: number): string => {
    if (days === 0) return '#10B981'; // green
    if (days <= 7) return '#3B82F6'; // blue
    if (days <= 14) return '#F59E0B'; // yellow
    if (days <= 30) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  // Add new contact
  const addContact = () => {
    if (newContactName.trim()) {
      const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
      const newContact: Contact = {
        id: newId,
        name: newContactName.trim(),
        lastContactDate: new Date().toISOString()
      };
      setContacts([...contacts, newContact]);
      setNewContactName('');
    }
  };

  // Remove contact
  const removeContact = (id: number) => {
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  // Mark contact as contacted today
  const markContactedToday = (id: number) => {
    setContacts(contacts.map(contact =>
      contact.id === id
        ? { ...contact, lastContactDate: new Date().toISOString() }
        : contact
    ));
  };

  return (
    <section style={{
      background: currentTheme.cardBackground,
      borderRadius: '1rem',
      padding: '1.5rem',
      boxShadow: isDarkMode ? '0 10px 30px rgba(0, 0, 0, 0.3)' : '0 10px 30px rgba(0, 0, 0, 0.1)',
      margin: '1.5rem auto',
      maxWidth: '1400px',
      width: '100%'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        color: currentTheme.textPrimary
      }}>
        <Users size={20} />
        <h2 style={{ flex: 1, fontSize: '1.25rem', margin: 0 }}>Relationship Manager</h2>
      </div>

      {/* Add new contact form */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Add new contact..."
          value={newContactName}
          onChange={(e) => setNewContactName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addContact()}
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
        <button onClick={addContact} style={{
          padding: '0.5rem 1rem',
          background: currentTheme.primary,
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <UserPlus size={16} />
          Add Contact
        </button>
      </div>

      {/* Contacts grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {contacts.map(contact => {
          const daysSince = getDaysSinceLastContact(contact.lastContactDate);
          const urgencyColor = getUrgencyColor(daysSince);

          return (
            <div key={contact.id} style={{
              background: currentTheme.backgroundMuted,
              border: `2px solid ${urgencyColor}`,
              borderRadius: '0.75rem',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {/* Contact name */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  color: currentTheme.textPrimary,
                  fontWeight: 600
                }}>
                  {contact.name}
                </h3>
                <button
                  onClick={() => removeContact(contact.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: currentTheme.textMuted,
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '0.25rem'
                  }}
                  title="Remove contact"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Days since last contact */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '0.75rem',
                  height: '0.75rem',
                  borderRadius: '50%',
                  backgroundColor: urgencyColor
                }} />
                <span style={{
                  fontSize: '0.875rem',
                  color: currentTheme.textSecondary
                }}>
                  {daysSince === 0 ? 'Contacted today' :
                   daysSince === 1 ? '1 day ago' :
                   `${daysSince} days ago`}
                </span>
              </div>

              {/* Last contact date */}
              <div style={{
                fontSize: '0.75rem',
                color: currentTheme.textMuted
              }}>
                Last contact: {new Date(contact.lastContactDate).toLocaleDateString()}
              </div>

              {/* Contacted today button */}
              <button
                onClick={() => markContactedToday(contact.id)}
                style={{
                  padding: '0.5rem',
                  background: currentTheme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <MessageCircle size={16} />
                Contacted Today
              </button>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {contacts.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: currentTheme.textMuted
        }}>
          <Users size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p style={{ margin: 0, fontSize: '1.1rem' }}>No contacts yet</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
            Add your first contact to start tracking relationships
          </p>
        </div>
      )}
    </section>
  );
};

export default RelationshipManager;