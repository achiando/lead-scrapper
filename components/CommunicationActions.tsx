'use client';

import React, { useState } from 'react';
import { MessageSquare, Phone, Mail, Edit2, Save, X } from 'lucide-react';
import { ClinicWithActions, MessageTemplate, defaultMessageTemplate, formatMessageSync, formatEmailMessageSync } from '@/lib/message-templates';

interface CommunicationActionsProps {
  clinic: ClinicWithActions;
}

export default function CommunicationActions({ clinic }: CommunicationActionsProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<'whatsapp' | 'sms' | 'email' | null>(null);
  const [templates, setTemplates] = useState<MessageTemplate>(defaultMessageTemplate);
  const [tempTemplate, setTempTemplate] = useState('');

  const handleWhatsApp = () => {
    const message = formatMessageSync(templates.whatsapp, clinic);
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleSMS = () => {
    const message = formatMessageSync(templates.sms, clinic);
    const encodedMessage = encodeURIComponent(message);
    // Open SMS with default messaging app or use a service
    window.open(`sms:?body=${encodedMessage}`, '_blank');
  };

  const handleEmail = () => {
    const emailData = formatEmailMessageSync(templates.email, clinic);
    const subject = encodeURIComponent(emailData.subject);
    const body = encodeURIComponent(emailData.body);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const startEditing = (type: 'whatsapp' | 'sms' | 'email') => {
    setEditingTemplate(type);
    if (type === 'email') {
      setTempTemplate(`${templates.email.subject}\n\n${templates.email.body}`);
    } else {
      setTempTemplate(templates[type]);
    }
  };

  const saveTemplate = () => {
    if (editingTemplate === 'email') {
      const lines = tempTemplate.split('\n\n');
      const subject = lines[0];
      const body = lines.slice(1).join('\n\n');
      setTemplates(prev => ({
        ...prev,
        email: { subject, body }
      }));
    } else if (editingTemplate === 'whatsapp' || editingTemplate === 'sms') {
      setTemplates(prev => ({
        ...prev,
        [editingTemplate]: tempTemplate
      }));
    }
    setEditingTemplate(null);
    setTempTemplate('');
  };

  const cancelEditing = () => {
    setEditingTemplate(null);
    setTempTemplate('');
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <button
          onClick={handleWhatsApp}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Send WhatsApp"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
        <button
          onClick={handleSMS}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Send SMS"
        >
          <Phone className="w-4 h-4" />
        </button>
        <button
          onClick={handleEmail}
          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          title="Send Email"
        >
          <Mail className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          title="Edit Templates"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {showTemplates && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
          <div className="p-4">
            <h3 className="font-bold text-lg mb-4">Message Templates</h3>
            
            {/* WhatsApp Template */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-sm text-green-600">WhatsApp</label>
                {editingTemplate !== 'whatsapp' ? (
                  <button
                    onClick={() => startEditing('whatsapp')}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={saveTemplate}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      <Save className="w-3 h-3" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              {editingTemplate === 'whatsapp' ? (
                <textarea
                  value={tempTemplate}
                  onChange={(e) => setTempTemplate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm h-20 resize-none"
                  placeholder="WhatsApp message template..."
                />
              ) : (
                <div className="p-2 bg-slate-50 rounded-lg text-sm text-slate-600 max-h-20 overflow-y-auto">
                  {templates.whatsapp}
                </div>
              )}
            </div>

            {/* SMS Template */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-sm text-blue-600">SMS</label>
                {editingTemplate !== 'sms' ? (
                  <button
                    onClick={() => startEditing('sms')}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={saveTemplate}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      <Save className="w-3 h-3" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              {editingTemplate === 'sms' ? (
                <textarea
                  value={tempTemplate}
                  onChange={(e) => setTempTemplate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm h-16 resize-none"
                  placeholder="SMS message template..."
                />
              ) : (
                <div className="p-2 bg-slate-50 rounded-lg text-sm text-slate-600">
                  {templates.sms}
                </div>
              )}
            </div>

            {/* Email Template */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium text-sm text-purple-600">Email</label>
                {editingTemplate !== 'email' ? (
                  <button
                    onClick={() => startEditing('email')}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={saveTemplate}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      <Save className="w-3 h-3" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              {editingTemplate === 'email' ? (
                <div>
                  <input
                    type="text"
                    value={tempTemplate.split('\n\n')[0] || ''}
                    onChange={(e) => {
                      const lines = tempTemplate.split('\n\n');
                      lines[0] = e.target.value;
                      setTempTemplate(lines.join('\n\n'));
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm mb-2"
                    placeholder="Subject..."
                  />
                  <textarea
                    value={tempTemplate.split('\n\n').slice(1).join('\n\n')}
                    onChange={(e) => {
                      const lines = tempTemplate.split('\n\n');
                      lines[1] = e.target.value;
                      setTempTemplate(lines.join('\n\n'));
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm h-24 resize-none"
                    placeholder="Email body..."
                  />
                </div>
              ) : (
                <div className="p-2 bg-slate-50 rounded-lg text-sm text-slate-600 max-h-32 overflow-y-auto">
                  <div className="font-medium text-purple-700 mb-1">Subject: {templates.email.subject}</div>
                  <div>{templates.email.body}</div>
                </div>
              )}
            </div>

            <div className="text-xs text-slate-500 mt-4">
              <div>Variables:</div>
              <div>{'{clinicName}'} - Clinic name</div>
              <div>{'{previewLink}'} - Demo website link</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
