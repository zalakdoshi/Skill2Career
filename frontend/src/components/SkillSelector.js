import React, { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/api';

const SkillSelector = ({ title, selectedSkills, onSkillsChange, category }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allSkills, setAllSkills] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const loadSkills = useCallback(async () => {
    try {
      const data = await dataService.getSkillsList();
      if (category === 'languages') {
        setAllSkills(data.languages || []);
      } else if (category === 'frameworks') {
        setAllSkills(data.frameworks || []);
      } else if (category === 'databases') {
        setAllSkills(data.databases || []);
      } else if (category === 'platforms') {
        setAllSkills(data.platforms || []);
      } else {
        setAllSkills(data.skills || []);
      }
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  }, [category]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = allSkills.filter(
        skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !selectedSkills.includes(skill)
      );
      setAvailableSkills(filtered.slice(0, 8));
      setShowDropdown(true);
      setHighlightedIndex(-1); // Reset highlighted index when search results change
    } else {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  }, [searchTerm, allSkills, selectedSkills]);

  const addSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      onSkillsChange([...selectedSkills, skill]);
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  const removeSkill = (skill) => {
    onSkillsChange(selectedSkills.filter(s => s !== skill));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showDropdown && availableSkills.length > 0) {
        setHighlightedIndex(prev => 
          prev < availableSkills.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showDropdown && availableSkills.length > 0) {
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : availableSkills.length - 1
        );
      }
    } else if (e.key === 'Enter' && searchTerm) {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < availableSkills.length) {
        addSkill(availableSkills[highlightedIndex]);
      } else if (availableSkills.length > 0) {
        addSkill(availableSkills[0]);
      } else if (searchTerm.trim()) {
        addSkill(searchTerm.trim());
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">{title}</label>
      <div className="skill-selector">
        <input
          type="text"
          className="form-input"
          placeholder={`Search or add ${title.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onFocus={() => searchTerm && setShowDropdown(true)}
        />
        
        {showDropdown && availableSkills.length > 0 && (
          <div className="skill-dropdown">
            {availableSkills.map((skill, idx) => (
              <div
                key={idx}
                className={`skill-option ${idx === highlightedIndex ? 'skill-option-highlighted' : ''}`}
                onClick={() => addSkill(skill)}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                {skill}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="selected-skills">
        {selectedSkills.map((skill, idx) => (
          <span
            key={idx}
            className="tag tag-removable"
            onClick={() => removeSkill(skill)}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SkillSelector;
