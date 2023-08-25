const schemas = {
  getOne: {
    params: {
      email: {
        type: "string",
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          user: {
            id: { type: "number" },
            name: { type: "string" },
            email: { type: "string" },
            teams: {
              id: { type: "number" },
              name: { type: "string" },
              code: { type: "string" },
              country: { type: "string" },
              translatedCountry: { type: "string" },
              founded: { type: "number" },
              logo: { type: "string" },
              venue: {
                id: { type: "number" },
                name: { type: "string" },
                address: { type: "string" },
                city: { type: "string" },
                capacity: { type: "string" },
                surface: { type: "string" },
                image: { type: "string" }
              }
            },
            createdAt: { type: "string" },
            isActive: { type: "number" },
          },
        },
      },
      400: {
        type: "string",
      },
      404: {
        type: "string",
      },
      500: {
        type: "string",
      },
    },
  },

  register: {
    body: {
      email: {
        type: "string",
      },
      teams: {
        type: "string",
      },
    },
    response: {
      201: {
        type: "string",
      },
      400: {
        type: "string",
      },
      500: {
        type: "string",
      },
    },
    headers: {
      type: "object",
      properties: {
        "Content-Type": {
          type: "string",
        },
      },
      required: ["Content-Type"],
    },
  },

  verifyEmail: {
    params: {
      email: {
        type: "string",
      },
      token: {
        type: "string",
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          user: {
            id: { type: "number" },
            name: { type: "string" },
            email: { type: "string" },
            teams: { type: "array" },
            created_at: { type: "string" },
            is_active: { type: "number" },
          },
        },
      },
      400: {
        type: "string",
      },
      404: {
        type: "string",
      },
      500: {
        type: "string",
      },
    },
  },

  updateTeams: {
    body: {
      email: {
        type: "string",
      },
      teams: {
        type: "string",
      },
    },
    response: {
      200: {
        type: "string",
      },
      400: {
        type: "string",
      },
      404: {
        type: "string",
      },
      500: {
        type: "string",
      },
    },
    headers: {
      type: "object",
      properties: {
        "Content-Type": {
          type: "string",
        },
      },
      required: ["Content-Type"],
    },
  },

  delete: {
    params: {
      email: {
        type: "string",
      },
    },
    response: {
      200: {
        type: "string",
      },
      400: {
        type: "string",
      },
      404: {
        type: "string",
      },
      500: {
        type: "string",
      },
    },
  },
};

export default schemas;
