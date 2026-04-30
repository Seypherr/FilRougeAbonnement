export const validate = (schema) => (req, _res, next) => {
  const parsed = schema.parse({
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (parsed.body) {
    req.body = parsed.body;
  }

  if (parsed.params) {
    req.params = parsed.params;
  }

  req.validatedQuery = parsed.query ?? req.query;
  next();
};
