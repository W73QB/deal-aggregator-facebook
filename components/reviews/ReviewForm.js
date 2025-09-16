import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import RatingStars from '../ui/RatingStars';
import LoadingSpinner from '../ui/LoadingSpinner';
import { createReview, updateReview } from '../../lib/store/slices/reviewsSlice';
import { addNotification } from '../../lib/store/slices/notificationSlice';
import './ReviewForm.css';

const ReviewForm = ({ dealId, editingReview = null, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { submitting } = useSelector(state => state.reviews);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    rating: editingReview?.rating || 0,
    title: editingReview?.title || '',
    content: editingReview?.content || ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  useEffect(() => {
    if (editingReview) {
      setFormData({
        rating: editingReview.rating,
        title: editingReview.title,
        content: editingReview.content
      });
    }
  }, [editingReview]);

  const validateField = (name, value) => {
    switch (name) {
      case 'rating':
        return value >= 1 && value <= 5 ? '' : 'Please select a rating from 1 to 5 stars';
      case 'title':
        if (!value.trim()) return 'Review title is required';
        if (value.length < 3) return 'Title must be at least 3 characters';
        if (value.length > 200) return 'Title must be less than 200 characters';
        return '';
      case 'content':
        if (!value.trim()) return 'Review content is required';
        if (value.length < 10) return 'Review must be at least 10 characters';
        if (value.length > 5000) return 'Review must be less than 5000 characters';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please login to write a review',
        duration: 4000
      }));
      return;
    }

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setTouched({ rating: true, title: true, content: true });
      return;
    }

    try {
      const reviewData = {
        ...formData,
        deal_id: dealId
      };

      if (editingReview) {
        await dispatch(updateReview({ id: editingReview.id, ...reviewData })).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Review updated successfully!',
          duration: 3000
        }));
      } else {
        await dispatch(createReview(reviewData)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Review posted successfully!',
          duration: 3000
        }));
      }
      
      // Reset form
      setFormData({ rating: 0, title: '', content: '' });
      setErrors({});
      setTouched({});
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || `Failed to ${editingReview ? 'update' : 'create'} review`,
        duration: 4000
      }));
    }
  };

  const handleCancel = () => {
    setFormData({ rating: 0, title: '', content: '' });
    setErrors({});
    setTouched({});
    if (onClose) onClose();
  };

  if (!isAuthenticated) {
    return (
      <div className="review-form-message">
        <p>Please login to write a review for this deal.</p>
      </div>
    );
  }

  return (
    <form className="review-form" onSubmit={handleSubmit} noValidate>
      <div className="form-header">
        <h3>{editingReview ? 'Edit Review' : 'Write a Review'}</h3>
        {onClose && (
          <button 
            type="button" 
            className="form-close-btn"
            onClick={onClose}
            aria-label="Close form"
          >
            ×
          </button>
        )}
      </div>

      {/* Rating Input */}
      <div className="form-group">
        <label className="form-label" id="rating-label">
          Rating *
        </label>
        <div className="rating-input" role="group" aria-labelledby="rating-label">
          <RatingStars
            rating={formData.rating}
            interactive={true}
            size="large"
            onRatingChange={(rating) => handleInputChange('rating', rating)}
          />
          <span className="rating-text" aria-live="polite">
            {formData.rating > 0 && `${formData.rating} star${formData.rating > 1 ? 's' : ''}`}
          </span>
        </div>
        {touched.rating && errors.rating && (
          <span className="form-error" role="alert">{errors.rating}</span>
        )}
      </div>

      {/* Title Input */}
      <div className="form-group">
        <label htmlFor="review-title" className="form-label">
          Review Title *
        </label>
        <input
          id="review-title"
          type="text"
          className={`form-input ${touched.title && errors.title ? 'form-input--error' : ''}`}
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
          placeholder="Summarize your experience with this deal..."
          maxLength={200}
          aria-describedby={touched.title && errors.title ? 'title-error' : 'title-help'}
        />
        <div className="form-help" id="title-help">
          {formData.title.length}/200 characters
        </div>
        {touched.title && errors.title && (
          <span id="title-error" className="form-error" role="alert">{errors.title}</span>
        )}
      </div>

      {/* Content Input */}
      <div className="form-group">
        <label htmlFor="review-content" className="form-label">
          Your Review *
        </label>
        <textarea
          id="review-content"
          className={`form-textarea ${touched.content && errors.content ? 'form-input--error' : ''}`}
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          onBlur={() => handleBlur('content')}
          placeholder="Tell others about your experience with this deal. Was it good value? Did you encounter any issues? Be honest and helpful!"
          rows={6}
          maxLength={5000}
          aria-describedby={touched.content && errors.content ? 'content-error' : 'content-help'}
        />
        <div className="form-help" id="content-help">
          {formData.content.length}/5000 characters
        </div>
        {touched.content && errors.content && (
          <span id="content-error" className="form-error" role="alert">{errors.content}</span>
        )}
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        {onClose && (
          <button 
            type="button" 
            className="form-btn form-btn--secondary"
            onClick={handleCancel}
            disabled={submitting}
          >
            Cancel
          </button>
        )}
        <button 
          type="submit" 
          className="form-btn form-btn--primary"
          disabled={submitting || Object.keys(validateForm()).length > 0}
        >
          {submitting ? (
            <LoadingSpinner size="small" text={editingReview ? 'Updating...' : 'Posting...'} />
          ) : (
            editingReview ? 'Update Review' : 'Post Review'
          )}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;