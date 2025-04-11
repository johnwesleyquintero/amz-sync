import { Schema } from 'ajv';

export const todoSchema: Schema = {
  type: 'object',
  required: ['phases'],
  properties: {
    phases: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'sections'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          sections: {
            type: 'array',
            items: {
              type: 'object',
              required: ['id', 'name', 'tasks'],
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                tasks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['id', 'text', 'completed'],
                    properties: {
                      id: { type: 'string' },
                      text: { type: 'string' },
                      completed: { type: 'boolean' },
                      owner: { type: ['string', 'null'] },
                      subTasks: {
                        type: 'array',
                        items: {
                          type: 'object',
                          required: ['id', 'text', 'completed'],
                          properties: {
                            id: { type: 'string' },
                            text: { type: 'string' },
                            completed: { type: 'boolean' },
                            owner: { type: ['string', 'null'] },
                            subTasks: {
                              type: 'array',
                              items: {
                                $ref: '#/properties/phases/items/properties/sections/items/properties/tasks/items'
                              },
                              default: []
                            }
                          },
                          additionalProperties: false
                        },
                        default: []
                      }
                    },
                    additionalProperties: false
                  }
                }
              },
              additionalProperties: false
            }
          }
        },
        additionalProperties: false
      }
    }
  },
  additionalProperties: false
};
