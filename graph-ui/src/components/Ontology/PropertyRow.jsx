import React from 'react';
import './PropertyRow.css';

/**
 * PropertyRow - Display a single property with inheritance indicators
 * 
 * @param {Object} property - Property object with id, label, source, etc.
 * @param {boolean} inherited - Whether this is an inherited property
 * @param {boolean} editable - Whether property value can be edited
 */
const PropertyRow = ({ property, inherited = false, editable = true, value, onChange }) => {
  const isRequired = property.required || false;
  const source = property.source || 'direct';
  const isInherited = source !== 'direct';

  const handleChange = (e) => {
    if (onChange) {
      onChange(property.id, e.target.value);
    }
  };

  return (
    <div className={`property-row ${isInherited ? 'inherited' : 'direct'}`}>
      <div className="property-header">
        <label className="property-label">
          {property.label}
          {isRequired && <span className="required-indicator">*</span>}
        </label>
        {isInherited && (
          <span className="inheritance-tag" title={`Inherited from ${source}`}>
            ↓ from {source}
          </span>
        )}
      </div>
      
      <div className="property-content">
        <input
          type="text"
          className="property-input"
          value={value || ''}
          onChange={handleChange}
          disabled={!editable}
          placeholder={property.description || `Enter ${property.label}`}
        />
        
        <div className="property-meta">
          <span className="property-type">{property.property_type}</span>
          {property.range && property.range.length > 0 && (
            <span className="property-range">→ {property.range.join(', ')}</span>
          )}
        </div>
      </div>

      {property.description && (
        <div className="property-description">
          {property.description}
        </div>
      )}
    </div>
  );
};

export default PropertyRow;
