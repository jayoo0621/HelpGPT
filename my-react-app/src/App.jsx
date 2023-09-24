import { useState, useRef } from 'react';
import { Configuration, OpenAIApi } from 'openai';
import './App.css';

//need to send all of the previous chat records to the ChatGPT API if I want ChatGPT to maintain the chat session. However, it will cost a lot, so it is not recommended in my opinion.

function App() {
  // utilize useRef to avoid unnecessary re-renders 
  const inputRef = useRef('');
  // state to store all the user prompts and responses from ChatGPT
  const [translated, setTranslated] = useState([]);
  // state to track the selected prompt option from the drop-down menu
  const [optionNum, setOptionNum] = useState(0);
  // configuration for openai module
  const configuration = new Configuration({
    apiKey: '',
  });
  // array to store different prompt options
  const promptOption = [
    // for regular chatGPT prompt
    '',
    // for fixing weird sentences
    `Could you fix this if there's any grammar error, typo or sound unusual to a native English speaker : `,
    // basic prompt value based on the selected option
    `Please make it less formal : `,
    // for translating Korean to English
    `Please translate this to English : `,
  ];
  // array to store the prompt options that will be displayed in the translated state
  const selectedOption = ['ChatGPT', '일반수정 ver', 'Less formal ver', '번역 ver'];
  // basic prompt value based on the selected option
  const basicPrompt = promptOption[optionNum];
  // initialize the openai module
  const openai = new OpenAIApi(configuration);

  // get current date and time options for timestamp
  const currentDate = new Date();

  const options = {
    month: 'short', // Short month name (e.g., 'Jul')
    day: 'numeric', // Day of the month (e.g., '30')
    hour: 'numeric', // Hour (e.g., '8' for 24-hour format or '8PM' for 12-hour format)
    minute: 'numeric', // Minute (e.g., '30')
    hour12: true, // Use 12-hour format (true) or 24-hour format (false)
    second: 'numeric',
  };

  // function to handle user's request to ChatGPT
  const requestToGPT = async (input) => {
    // final prompt will be basicPrompt combined with what the user inputs in the input field
    const prompt = basicPrompt + input;
    // get the response from the chatGPT api
    const result = await sendRequest(prompt);
    // store the response in the translated state with the appropriate format
    setTranslated([
      ...translated,
      [
        new Intl.DateTimeFormat('en-US', options).format(currentDate),
        `입력한 문장 : ${input}`,
        `${selectedOption[optionNum]} : ${result}`,
      ],
    ]);
    // clear the input field after submitting the request
    inputRef.current.value = '';
  };

  // function to send the request to ChatGPT API's endpoint
  const sendRequest = async (prompt) => {
    try {
      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
      });
      const result = completion.data.choices[0].message.content;
      return result;
    } catch (err) {
      // the error handling needs to be refactored
      alert(err);
      return;
    }
  };

  return (
    <>
      <h1>GPT야 나를 도와줘!</h1>
      <div className="card">
        <input
          type="text"
          ref={inputRef}
          placeholder={"무엇을 도와드릴까요?"}
        />
        <button onClick={() => requestToGPT(inputRef.current.value)}>
          submit
        </button>
        <select onChange={(e) => setOptionNum(e.target.value)}>
          <option value={0}> Normal ChatGPT </option>
          <option value={1}> 문법오류,오타, 어색한 문장들 수정 </option>
          <option value={2}> Less formal 하게 수정 </option>
          <option value={3}> 한글로 입력 후 번역 </option>
        </select>
        <></>
      </div>
      <div>
        {translated.map((el, index) => {
          return (
            <div className="response" key={index}>
              <p>{el[0]}</p>
              <p>{el[1]}</p>
              <p>{el[2]}</p>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default App;
