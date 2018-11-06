const watson = require('watson-developer-cloud');
const contextList = require('./context');
const assistant = new watson.AssistantV1({
  iam_apikey: process.env.ASSISTANT_IAM_APIKEY,
  version: '2018-09-20'
});


const message = (conversation_id, text) => {
    const payload = {
        workspace_id: process.env.WORKSPACE_ID,
        context: contextList[conversation_id],
        input: { text },
    };
    return new Promise((resolve,reject)=>{
        assistant.message(payload, function (err, data) {
            if (err) {
                reject();
            }
            contextList[conversation_id] = { ...data.context };
            resolve(updateMessage(payload, data).output.text[0]);
        });
    });
};

const updateMessage = (input, response) => {
    if (!response.output) {
        response.output = {
            text:[]
        };
    }
    return response;
}

module.exports = {
    message
};