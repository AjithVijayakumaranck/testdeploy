const feedbackController = require('../Controllers/feedbackController');
const { authoriseJwt } = require('../utilities/authorisation');

const router = require('express').Router();


router.post('/post_feedback',authoriseJwt,feedbackController.postFeedback)


module.exports = router;