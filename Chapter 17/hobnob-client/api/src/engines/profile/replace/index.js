import elasticsearch from 'elasticsearch';
const client = new elasticsearch.Client({
  host: `${process.env.ELASTICSEARCH_HOSTNAME}:${process.env.ELASTICSEARCH_PORT}`,
});

import ValidationError from '../../../validators/errors/validation-error';
import validate from '../../../validators/profile/replace';

function replace (req) {
  const validationResults = validate(req);
  if (validationResults instanceof ValidationError) {
    return Promise.reject(validationResults);
  }
  return client.update({
    index: process.env.ELASTICSEARCH_INDEX,
    type: 'user',
    id: req.params.userId,
    body: {
      script: {
        lang: 'painless',
        source: 'ctx._source.profile = params.profile',
        params: {
          profile: req.body
        }
      }
    }
  })
  .then(res => undefined)
  .catch(err => {
    if (err.status === 404) {
      return Promise.reject(new Error('Not Found'));
    }
    return Promise.reject(new Error('Internal Server Error'))
  });
}

export default replace;
