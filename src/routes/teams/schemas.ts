const schemas = {
  get: {
    params: {
      id: {
        type: "number",
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          team: {
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
};

export default schemas;
