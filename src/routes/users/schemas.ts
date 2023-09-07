const schemas = {
  signUp: {
    body: {
      name: {
        type: "string",
      },
      password: {
        type: "string",
      },
      email: {
        type: "string",
      },
      teams: {
        type: "array",
      },
    },
    response: {
      201: {
        type: "object",
        properties: {
          success: {
            type: "string",
          },
        },
      },
      400: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      500: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
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

  signIn: {
    body: {
      email: {
        type: "string",
      },
      password: {
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
                image: { type: "string" },
              },
            },
            createdAt: { type: "string" },
            isActive: { type: "number" },
          },
          jwt: {
            type: "string",
          },
        },
      },
      400: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      401: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      404: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      500: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
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
                image: { type: "string" },
              },
            },
            createdAt: { type: "string" },
            isActive: { type: "number" },
          },
          jwt: {
            type: "string",
          },
        },
      },
      400: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      404: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      500: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
    },
  },

  update: {
    body: {
      name: {
        type: "string",
      },
      password: {
        type: "string",
      },
      email: {
        type: "string",
      },
      userTeams: {
        type: "object",
        properties: {
          removeAll: {
            type: "boolean",
          },
          teamsToRemove: {
            type: "array",
          },
          teamsToAdd: {
            type: "array",
          },
        },
      },
    },
    response: {
      201: {
        type: "object",
        properties: {
          success: {
            type: "string",
          },
        },
      },
      400: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      401: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      404: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      500: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
    },
    headers: {
      type: "object",
      properties: {
        Authorization: {
          type: "string",
        },
      },
      required: ["Authorization"],
    },
  },

  forgotPassword: {
    body: {
      email: {
        type: "string",
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          success: {
            type: "string",
          },
        },
      },
      400: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      404: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      500: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
    },
  },

  resetPassword: {
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
          success: {
            type: "string",
          },
        },
      },
      400: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      404: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      500: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
    },
  },

  delete: {
    body: {
      password: {
        type: "string",
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          success: {
            type: "string",
          },
        },
      },
      400: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      401: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      404: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
      500: {
        type: "object",
        properties: {
          error: {
            type: "string",
          },
        },
      },
    },
    headers: {
      type: "object",
      properties: {
        Authorization: {
          type: "string",
        },
      },
      required: ["Authorization"],
    },
  },
};

export default schemas;
