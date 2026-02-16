import React, { useState, useEffect } from 'react';
import { getClassFull, createInstance } from '../../services/ontologyApi';
import PropertyRow from './PropertyRow';
import './InstanceEditor.css';

/**
 * InstanceEditor - Create/edit ontology instances with validation
 * 
 * Features:
 * - Displays all properties (direct + inherited)
 * - Shows inheritance source for each property
 * - Validates required properties before submission
 * - Clear error messages for validation failures
 */
const InstanceEditor = ({ classId, instanceData = null, onSave, onCancel }) => {
  const [classInfo, setClassInfo] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    label: '',
    properties: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    loadClassInfo();
  }, [classId]);

  useEffect(() => {
    if (instanceData) {
      setFormData({
        id: instanceData.id || '',
        label: instanceData.label || '',
        properties: instanceData.properties || {}
      });
    }
  }, [instanceData]);

  const loadClassInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getClassFull(classId);
      setClassInfo(response.data.data);
    } catch (err) {
      console.error('Error loading class info:', err);
      setError(err.response?.data?.error || 'Failed to load class information');
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyChange = (propertyId, value) => {
    setFormData(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        [propertyId]: value
      }
    }));
    // Clear validation errors when user starts typing
    setValidationErrors([]);
  };

  const validateForm = () => {
    const errors = [];
    
    // Check required fields
    if (!formData.id.trim()) {
      errors.push('Instance ID is required');
    }
    if (!formData.label.trim()) {
      errors.push('Instance label is required');
    }

    // Check required properties
    if (classInfo && classInfo.all_properties) {
      classInfo.all_properties.forEach(prop => {
        if (prop.required) {
          const value = formData.properties[prop.id];
          if (!value || value.trim() === '') {
            const source = prop.source !== 'direct' 
              ? ` (inherited from ${prop.source})`
              : '';
            errors.push(`Missing required property: ${prop.label}${source}`);
          }
        }
      });
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setSaving(true);
      setError(null);
setValidationErrors([]);      
      const instancePayload = {
        id: formData.id,
        label: formData.label,
        class_ids: [classId],
        properties: formData.properties
      };

      const response = await createInstance(instancePayload);
      
      if (onSave) {
        onSave(response.data.data);
      }
    } catch (err) {
      console.error('Error saving instance:', err);
      
      // Handle validation errors from backend (422)
      if (err.response?.status === 422 && err.response?.data?.details) {
        setValidationErrors(err.response.data.details);
      } else {
        setError(err.response?.data?.error || 'Failed to save instance');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="instance-editor loading">
        <div className="spinner">Loading class information...</div>
      </div>
    );
  }

  if (error && !classInfo) {
    return (
      <div className="instance-editor error">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={onCancel}>Close</button>
        </div>
      </div>
    );
  }

  const allProperties = classInfo?.all_properties || [];
  const directProperties = allProperties.filter(p => p.source === 'direct');
  const inheritedProperties = allProperties.filter(p => p.source !== 'direct');

  return (
    <div className="instance-editor">
      <div className="editor-header">
        <h2>
          {instanceData ? 'Edit' : 'Create'} Instance of {classInfo?.label}
        </h2>
        {classInfo?.description && (
          <p className="class-description">{classInfo.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-field">
            <label>
              Instance ID <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
              placeholder="e.g., prof:alice_johnson"
              disabled={!!instanceData} 
            />
          </div>

          <div className="form-field">
            <label>
              Display Name <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              placeholder="e.g., Professor Alice Johnson"
            />
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="validation-errors">
            <h4>⚠️ Validation Errors</h4>
            <ul>
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Direct Properties */}
        {directProperties.length > 0 && (
          <div className="form-section">
            <h3>
              <span className="section-icon direct">●</span>
              Direct Properties ({directProperties.length})
            </h3>
            <div className="properties-form">
              {directProperties.map(prop => (
                <PropertyRow
                  key={prop.id}
                  property={prop}
                  inherited={false}
                  editable={true}
                  value={formData.properties[prop.id] || ''}
                  onChange={handlePropertyChange}
                />
              ))}
            </div>
          </div>
        )}

        {/* Inherited Properties */}
        {inheritedProperties.length > 0 && (
          <div className="form-section inherited-section">
            <h3>
              <span className="section-icon inherited">↓</span>
              Inherited Properties ({inheritedProperties.length})
            </h3>
            <p className="section-note">
              These properties are inherited from parent classes and must be provided.
            </p>
            <div className="properties-form">
              {inheritedProperties.map(prop => (
                <PropertyRow
                  key={`${prop.source}-${prop.id}`}
                  property={prop}
                  inherited={true}
                  editable={true}
                  value={formData.properties[prop.id] || ''}
                  onChange={handlePropertyChange}
                />
              ))}
            </div>
          </div>
        )}

        {/* General Error */}
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : (instanceData ? 'Update' : 'Create')} Instance
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="help-section">
        <h4>💡 Tip</h4>
        <p>
          Fields marked with <span className="required">*</span> are required. 
          Inherited properties (marked with ↓) must also be filled in, 
          even though they come from parent classes.
        </p>
      </div>
    </div>
  );
};

export default InstanceEditor;
