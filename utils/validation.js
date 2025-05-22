import Joi from 'joi';

// Validation rules for adding a new school (works for Indian schools too)
const addSchoolValidation = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .required()
        .messages({
            'string.empty': 'School name is required',
            'string.min': 'School name must be at least 2 characters long',
            'string.max': 'School name cannot exceed 255 characters'
        }),

    address: Joi.string()
        .trim()
        .min(5)
        .max(500)
        .required()
        .messages({
            'string.empty': 'School address is required',
            'string.min': 'Address must be at least 5 characters long',
            'string.max': 'Address cannot exceed 500 characters'
        }),

    latitude: Joi.number()
        .min(-90)
        .max(90)
        .required()
        .messages({
            'number.base': 'Latitude must be a valid number',
            'number.min': 'Latitude must be between -90 and 90 degrees',
            'number.max': 'Latitude must be between -90 and 90 degrees',
            'any.required': 'Latitude is required'
        }),

    longitude: Joi.number()
        .min(-180)
        .max(180)
        .required()
        .messages({
            'number.base': 'Longitude must be a valid number',
            'number.min': 'Longitude must be between -180 and 180 degrees',
            'number.max': 'Longitude must be between -180 and 180 degrees',
            'any.required': 'Longitude is required'
        })
});

// Validation rules for listing schools (user location in India)
const listSchoolsValidation = Joi.object({
    latitude: Joi.number()
        .min(-90)
        .max(90)
        .required()
        .messages({
            'number.base': 'Your latitude must be a valid number',
            'number.min': 'Your latitude must be between -90 and 90 degrees',
            'number.max': 'Your latitude must be between -90 and 90 degrees',
            'any.required': 'Your location (latitude) is required to find nearby schools'
        }),

    longitude: Joi.number()
        .min(-180)
        .max(180)
        .required()
        .messages({
            'number.base': 'Your longitude must be a valid number',
            'number.min': 'Your longitude must be between -180 and 180 degrees',
            'number.max': 'Your longitude must be between -180 and 180 degrees',
            'any.required': 'Your location (longitude) is required to find nearby schools'
        })
});

export { addSchoolValidation, listSchoolsValidation };