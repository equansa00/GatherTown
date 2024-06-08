// middleware/errorHandlers.js

const handleErrors = (error, req, res, next) => {
  console.error('Error:', error.message);

  if (error.type === 'not-found') {
    res.status(404).json({ msg: error.message });
  } else if (error.type === 'unauthorized') {
    res.status(401).json({ msg: error.message });
  } else if (error.errors) { // Handle express-validator errors
    res.status(400).json({ errors: error.errors });
  } else {
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

const handleServerError = (res, error) => {
  console.error('Server Error:', error);
  res.status(500).json({ error: 'Server error', details: error.message });
};

module.exports = { handleServerError, handleErrors };
