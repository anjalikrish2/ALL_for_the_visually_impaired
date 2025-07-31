let currentQuestion = null;
let selectedOptionIndex = 0;
let voiceEnabled = true;
let debugMode = false;
let isAnswered = false;
let speechRate = 0.9; // Default speech rate
let autoAdvanceTimeout = null; // Timeout for auto-advance
let currentVoice = null; // Store selected voice

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 App initialized');
  document.addEventListener('keydown', handleKeyNavigation);
  setupVoiceControls(); // Initialize voice controls with Indian voice preference
  setTimeout(() => {
    getContent();
  }, 500);
});

// Initialize voice selection and speed controls
function setupVoiceControls() {
  const voiceControls = document.getElementById('voice-controls');
  if (!voiceControls) return;

  // Create voice selection dropdown
  const voiceLabel = document.createElement('span');
  voiceLabel.textContent = 'Voice: ';
  voiceLabel.style.marginLeft = '10px';
  voiceControls.appendChild(voiceLabel);

  const voiceSelect = document.createElement('select');
  voiceSelect.id = 'voice-select';
  voiceControls.appendChild(voiceSelect);

  // Populate voices
  function populateVoices() {
    const voices = window.speechSynthesis.getVoices();
    console.log('🎙️ Available voices:', voices);

    voiceSelect.innerHTML = '<option value="">Default Voice</option>';
    // Sort voices to prioritize en-IN, then other English voices
    const sortedVoices = voices.sort((a, b) => {
      if (a.lang === 'en-IN') return -1;
      if (b.lang === 'en-IN') return 1;
      if (a.lang.startsWith('en-')) return -1;
      if (b.lang.startsWith('en-')) return 1;
      return a.name.localeCompare(b.name);
    });

    sortedVoices.forEach((voice, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });

    // Default to first en-IN voice, then en-US, then first available
    const defaultVoice = voices.find(v => v.lang === 'en-IN') ||
                        voices.find(v => v.lang === 'en-US') ||
                        voices[0];
    if (defaultVoice) {
      currentVoice = defaultVoice;
      voiceSelect.value = voices.indexOf(defaultVoice);
      console.log('🎙️ Default voice set:', defaultVoice.name, defaultVoice.lang);
      if (voiceEnabled) {
        speak(`Voice set to ${defaultVoice.name} with ${defaultVoice.lang} accent.`);
      }
    }
  }

  // Populate voices initially and when voices change
  populateVoices();
  window.speechSynthesis.onvoiceschanged = populateVoices;

  // Handle voice selection
  voiceSelect.addEventListener('change', () => {
    const voices = window.speechSynthesis.getVoices();
    const selectedIndex = voiceSelect.value;
    currentVoice = selectedIndex ? voices[selectedIndex] : null;
    console.log('🎙️ Voice selected:', currentVoice ? `${currentVoice.name} (${currentVoice.lang})` : 'Default');
    if (voiceEnabled && currentVoice) {
      speak(`Voice changed to ${currentVoice.name} with ${currentVoice.lang} accent.`);
      // Save to localStorage
      localStorage.setItem('selectedVoiceIndex', selectedIndex);
    }
  });

  // Load saved voice preference
  const savedVoiceIndex = localStorage.getItem('selectedVoiceIndex');
  if (savedVoiceIndex) {
    const voices = window.speechSynthesis.getVoices();
    if (voices[savedVoiceIndex]) {
      currentVoice = voices[savedVoiceIndex];
      voiceSelect.value = savedVoiceIndex;
      console.log('🎙️ Loaded saved voice:', currentVoice.name, currentVoice.lang);
    }
  }

  // Create speed control UI
  const speedLabel = document.createElement('span');
  speedLabel.textContent = 'Voice Speed: ';
  voiceControls.appendChild(speedLabel);

  const speedDisplay = document.createElement('span');
  speedDisplay.id = 'speed-display';
  speedDisplay.textContent = `${speechRate}x`;
  voiceControls.appendChild(speedDisplay);

  const slowerBtn = document.createElement('button');
  slowerBtn.textContent = 'Slower';
  slowerBtn.style.margin = '0 5px';
  slowerBtn.addEventListener('click', () => {
    adjustSpeechRate(-0.1);
    speak(`Voice speed set to ${speechRate.toFixed(1)} times.`);
  });
  voiceControls.appendChild(slowerBtn);

  const fasterBtn = document.createElement('button');
  fasterBtn.textContent = 'Faster';
  fasterBtn.style.margin = '0 5px';
  fasterBtn.addEventListener('click', () => {
    adjustSpeechRate(0.1);
    speak(`Voice speed set to ${speechRate.toFixed(1)} times.`);
  });
  voiceControls.appendChild(fasterBtn);

  // Add test voice button
  const testVoiceBtn = document.createElement('button');
  testVoiceBtn.textContent = 'Test Voice';
  testVoiceBtn.style.margin = '0 5px';
  testVoiceBtn.addEventListener('click', () => {
    speak('This is a test of the selected voice with an Indian English accent.');
  });
  voiceControls.appendChild(testVoiceBtn);
}

// Adjust speech rate with bounds (0.5x to 2.0x)
function adjustSpeechRate(delta) {
  speechRate = Math.max(0.5, Math.min(2.0, speechRate + delta));
  speechRate = Math.round(speechRate * 10) / 10; // Round to 1 decimal
  const speedDisplay = document.getElementById('speed-display');
  if (speedDisplay) {
    speedDisplay.textContent = `${speechRate}x`;
  }
  console.log(`🎙️ Speech rate adjusted to: ${speechRate}x`);
}

// Improved speech function with rate control and voice selection
function speak(text, priority = false) {
  if (!voiceEnabled || !window.speechSynthesis) {
    console.log('🔇 Speech disabled or not available');
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    try {
      const cleanText = extractText(text);
      if (!cleanText) {
        resolve();
        return;
      }

      console.log('🔊 Speaking:', cleanText);
      if (priority) window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = currentVoice ? currentVoice.lang : 'en-IN'; // Default to en-IN
      utterance.rate = speechRate;
      utterance.pitch = 1;
      utterance.volume = 1;

      if (currentVoice) {
        utterance.voice = currentVoice;
        console.log('🎙️ Using voice:', currentVoice.name, currentVoice.lang);
      } else {
        console.warn('⚠️ No voice selected, using default with en-IN lang');
      }

      utterance.onend = () => resolve();
      utterance.onerror = (err) => {
        console.error('🎤 Speech error:', err);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('🎤 Speech error:', error);
      resolve();
    }
  });
}

// Simplified text extraction
function extractText(value) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    const textProps = ['text', 'value', 'message', 'content', 'label', 'title', 'name'];
    for (const prop of textProps) {
      if (value[prop] && typeof value[prop] === 'string') return value[prop].trim();
    }
    if (Array.isArray(value)) {
      return value.map(item => extractText(item)).filter(Boolean).join(', ');
    }
  }
  return String(value || '').trim();
}

function getErrorMessage(err) {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    return err.message || err.error || err.details || err.statusText || 'Unknown error';
  }
  return 'An unknown error occurred';
}

async function getContent() {
  if (autoAdvanceTimeout) {
    clearTimeout(autoAdvanceTimeout);
    autoAdvanceTimeout = null;
  }

  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const contentContainer = document.getElementById('quiz');
  const audioSection = document.getElementById('audio-section');
  const debugInfo = document.getElementById('debug-info');

  try {
    console.log('📡 Fetching content...');
    loading.style.display = 'block';
    error.style.display = 'none';
    contentContainer.innerHTML = '';
    audioSection.style.display = 'none';

    isAnswered = false;
    selectedOptionIndex = 0;

    const res = await fetch('/api/content', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    console.log('📦 Received data:', data);

    loading.style.display = 'none';

    if (data.success === false) {
      throw new Error(data.error || 'API returned unsuccessful response');
    }

    if (debugMode) {
      const debugContent = {
        receivedData: data,
        timestamp: new Date().toISOString()
      };
      document.getElementById('debug-content').textContent = JSON.stringify(debugContent, null, 2);
      debugInfo.style.display = 'block';
    }

    if (!data || !data.content || !Array.isArray(data.content) || data.content.length === 0) {
      throw new Error('No valid content received from server');
    }

    const content = data.content[0];
    console.log('📝 Processing content item:', content);

    const validOptions = content.options
      .map(opt => extractText(opt))
      .filter(opt => opt && opt.trim() && !['Option A', 'Option B', 'Option C', 'Option D'].includes(opt.trim()));

    if (validOptions.length < 2) {
      console.warn('⚠️ Not enough valid options, adding contextual alternatives');
      const contextualOptions = generateContextualOptions(content.sentence, validOptions);
      validOptions.push(...contextualOptions.slice(0, 4 - validOptions.length));
    }

    currentQuestion = {
      ...content,
      sentence: extractText(content.sentence),
      options: validOptions,
      correctAnswer: extractText(content.correctAnswer)
    };

    console.log('✅ Processed question:', {
      sentence: currentQuestion.sentence,
      options: currentQuestion.options,
      correctAnswer: currentQuestion.correctAnswer
    });

    if (!currentQuestion.sentence) throw new Error('No valid question text found');
    if (currentQuestion.options.length < 2) throw new Error('Not enough valid options');
    if (!currentQuestion.correctAnswer) {
      console.warn('⚠️ No correct answer, using first option');
      currentQuestion.correctAnswer = currentQuestion.options[0];
    }

    if (!currentQuestion.options.includes(currentQuestion.correctAnswer)) {
      console.warn('⚠️ Correct answer not in options, adding it');
      currentQuestion.options[currentQuestion.options.length - 1] = currentQuestion.correctAnswer;
    }

    if (data.totalQuestions && data.currentIndex) {
      await speak(`Question ${data.currentIndex} of ${data.totalQuestions}. ${currentQuestion.sentence}`, true);
    } else {
      await speak(currentQuestion.sentence, true);
    }

    renderQuestion(currentQuestion, data.totalQuestions, data.currentIndex);

    if (content.audio && content.audio.url) {
      console.log('🎵 Audio available:', content.audio.url);
      const announcementAudio = document.getElementById('announcementAudio');
      announcementAudio.src = content.audio.url;
      audioSection.style.display = 'block';
      speak('Audio is available.');
    }
  } catch (err) {
    console.error('❌ Error fetching content:', err);
    const errorMessage = getErrorMessage(err);
    error.textContent = `Failed to fetch content: ${errorMessage}`;
    error.style.display = 'block';
    loading.style.display = 'none';
    contentContainer.innerHTML = '';
    if (debugMode) {
      const errorDebug = {
        error: err,
        errorMessage: errorMessage,
        timestamp: new Date().toISOString()
      };
      document.getElementById('debug-content').textContent = JSON.stringify(errorDebug, null, 2);
      debugInfo.style.display = 'block';
    }
    await speak('Error loading content. Please try again.', true);
  }
}

function generateContextualOptions(sentence, existingOptions) {
  const lowerSentence = sentence.toLowerCase();
  let options = [];

  if (lowerSentence.includes('food') || lowerSentence.includes('idli') || lowerSentence.includes('chocolates')) {
    options = ['Pizza', 'Sushi', 'Pasta', 'Salad'];
  } else if (lowerSentence.includes('cartoon') || lowerSentence.includes('tv')) {
    options = ['News', 'Movies', 'Sports', 'Documentaries'];
  } else if (lowerSentence.includes('sport') || lowerSentence.includes('hockey')) {
    options = ['Soccer', 'Basketball', 'Tennis', 'Cricket'];
  } else if (lowerSentence.includes('color') || lowerSentence.includes('colour')) {
    options = ['Purple', 'Orange', 'Pink', 'White'];
  } else if (lowerSentence.includes('time') || lowerSentence.includes('waking')) {
    options = ['Midnight', 'Noon', 'Evening', 'Dawn'];
  } else {
    options = ['Alternative 1', 'Alternative 2', 'Alternative 3', 'Alternative 4'];
  }

  return options.filter(opt => !existingOptions.includes(opt));
}

function renderQuestion(content, totalQuestions = null, currentIndex = null) {
  const container = document.getElementById('quiz');
  container.innerHTML = '';

  console.log('🎨 Rendering question:', content);

  const questionCard = document.createElement('div');
  questionCard.className = 'card';

  const questionTitle = document.createElement('h3');
  questionTitle.textContent = totalQuestions && currentIndex ? 
    `❓ Question ${currentIndex} of ${totalQuestions}` : '❓ Question';
  questionCard.appendChild(questionTitle);

  const questionTextEl = document.createElement('div');
  questionTextEl.className = 'text-content';
  questionTextEl.style.whiteSpace = 'pre-wrap';
  questionTextEl.textContent = content.sentence;
  questionCard.appendChild(questionTextEl);

  container.appendChild(questionCard);

  const optionsCard = document.createElement('div');
  optionsCard.className = 'card';

  const optionsTitle = document.createElement('h3');
  optionsTitle.textContent = '🎯 Choose the correct answer:';
  optionsCard.appendChild(optionsTitle);

  const optionsList = document.createElement('div');
  optionsList.className = 'options';
  optionsList.setAttribute('id', 'optionsList');

  content.options.forEach((optionText, index) => {
    console.log(`🎨 Creating option ${index + 1}: "${optionText}"`);
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option';
    optionDiv.textContent = `${index + 1}. ${optionText}`;
    optionDiv.setAttribute('data-index', index);
    optionDiv.setAttribute('tabindex', '0');

    optionDiv.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      console.log(`🖱️ CLICK DETECTED on option ${index + 1}: "${optionText}"`);
      if (isAnswered) {
        console.log('⚠️ Question already answered');
        return;
      }
      selectedOptionIndex = index;
      updateSelection();
      speak(`Selected option ${index + 1}: ${optionText}`);
    });

    optionDiv.addEventListener('mouseenter', function() {
      if (!isAnswered && !this.classList.contains('selected')) {
        this.style.backgroundColor = '#f0f4ff';
      }
    });

    optionDiv.addEventListener('mouseleave', function() {
      if (!isAnswered && !this.classList.contains('selected')) {
        this.style.backgroundColor = '';
      }
    });

    if (index === selectedOptionIndex) {
      optionDiv.classList.add('selected');
    }

    optionsList.appendChild(optionDiv);
  });

  optionsCard.appendChild(optionsList);

  const submitBtn = document.createElement('button');
  submitBtn.className = 'submit-btn';
  submitBtn.textContent = '✅ Submit Answer';
  submitBtn.style.width = '100%';
  submitBtn.style.padding = '15px';
  submitBtn.style.fontSize = '16px';
  submitBtn.style.fontWeight = 'bold';

  submitBtn.addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log('🖱️ SUBMIT BUTTON CLICKED');
    if (!isAnswered) submitAnswer();
  });

  optionsCard.appendChild(submitBtn);
  container.appendChild(optionsCard);

  updateSelection();
  console.log('🎨 Question rendered successfully');
  console.log('🎨 Options count:', content.options.length);
}

function updateSelection() {
  const options = document.querySelectorAll('.option');
  console.log(`🎯 Updating selection to index ${selectedOptionIndex}`);

  options.forEach((option, index) => {
    option.classList.remove('selected');
    option.style.backgroundColor = '';
    option.style.borderLeft = '';
    option.style.fontWeight = '';

    if (index === selectedOptionIndex) {
      option.classList.add('selected');
      option.style.backgroundColor = '#e3f2fd';
      option.style.borderLeft = '4px solid #2196F3';
      option.style.fontWeight = 'bold';
      console.log(`✅ Highlighted option ${index + 1}`);
    }
  });
}

async function submitAnswer() {
  if (!currentQuestion || isAnswered) {
    console.log('⚠️ No question or already answered');
    return;
  }

  if (autoAdvanceTimeout) {
    clearTimeout(autoAdvanceTimeout);
    autoAdvanceTimeout = null;
  }

  console.log('📝 SUBMITTING ANSWER...');
  console.log('📝 Selected index:', selectedOptionIndex);
  console.log('📝 Options:', currentQuestion.options);
  console.log('📝 Correct answer:', currentQuestion.correctAnswer);

  if (selectedOptionIndex < 0 || selectedOptionIndex >= currentQuestion.options.length) {
    console.error('❌ Invalid option index');
    await speak('Please select a valid option.');
    return;
  }

  isAnswered = true;
  const selectedAnswer = currentQuestion.options[selectedOptionIndex];
  const correctAnswer = currentQuestion.correctAnswer;

  console.log('📝 COMPARISON:');
  console.log('📝 Selected:', `"${selectedAnswer}"`);
  console.log('📝 Correct:', `"${correctAnswer}"`);

  const isCorrect = selectedAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

  console.log('📝 Result:', isCorrect ? 'CORRECT ✅' : 'INCORRECT ❌');

  const options = document.querySelectorAll('.option');
  options.forEach((option, index) => {
    const optionText = currentQuestion.options[index];

    if (optionText.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
      option.classList.add('correct');
      option.style.backgroundColor = '#e8f5e8';
      option.style.borderLeft = '4px solid #4CAF50';
      option.style.color = '#2e7d32';
      console.log(`✅ Marked option ${index + 1} as correct`);
    } else if (index === selectedOptionIndex && !isCorrect) {
      option.classList.add('incorrect');
      option.style.backgroundColor = '#ffebee';
      option.style.borderLeft = '4px solid #f44336';
      option.style.color = '#c62828';
      console.log(`❌ Marked option ${index + 1} as incorrect`);
    }

    option.style.cursor = 'not-allowed';
    option.style.pointerEvents = 'none';
  });

  const feedback = document.createElement('div');
  feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
  feedback.style.padding = '20px';
  feedback.style.margin = '20px 0';
  feedback.style.borderRadius = '8px';
  feedback.style.textAlign = 'center';
  feedback.style.fontWeight = 'bold';
  feedback.style.fontSize = '18px';

  if (isCorrect) {
    feedback.textContent = '🎉 Correct! Well done!';
    feedback.style.backgroundColor = '#e8f5e8';
    feedback.style.color = '#2e7d32';
    feedback.style.border = '2px solid #4CAF50';
    await speak('Correct! Well done!', true);
  } else {
    feedback.textContent = `❌ Incorrect. The correct answer is: ${correctAnswer}`;
    feedback.style.backgroundColor = '#ffebee';
    feedback.style.color = '#c62828';
    feedback.style.border = '2px solid #f44336';
    await speak(`Incorrect. The correct answer is: ${correctAnswer}`, true);
  }

  const optionsCard = document.querySelector('.card:last-child');
  optionsCard.appendChild(feedback);

  const submitBtn = document.querySelector('.submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = '✅ Answer Submitted';
    submitBtn.style.opacity = '0.6';
    submitBtn.style.cursor = 'not-allowed';
  }

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '➡️ Next Question';
  nextBtn.className = 'next-btn';
  nextBtn.style.width = '100%';
  nextBtn.style.padding = '15px';
  nextBtn.style.fontSize = '16px';
  nextBtn.style.fontWeight = 'bold';
  nextBtn.style.marginTop = '10px';
  nextBtn.style.backgroundColor = '#2196F3';
  nextBtn.style.color = 'white';
  nextBtn.style.border = 'none';
  nextBtn.style.borderRadius = '5px';
  nextBtn.style.cursor = 'pointer';

  nextBtn.addEventListener('click', function(event) {
    event.preventDefault();
    console.log('🖱️ Next button clicked');
    if (autoAdvanceTimeout) {
      clearTimeout(autoAdvanceTimeout);
      autoAdvanceTimeout = null;
    }
    getContent();
  });

  optionsCard.appendChild(nextBtn);

  autoAdvanceTimeout = setTimeout(() => {
    console.log('⏰ Auto-advancing to next question after 3 seconds');
    getContent();
  }, 3000);
}

function handleKeyNavigation(e) {
  if (!currentQuestion) return;

  const optionsCount = currentQuestion.options.length;

  switch (e.key.toLowerCase()) {
    case 'arrowup':
    case 'w':
      e.preventDefault();
      if (!isAnswered) {
        selectedOptionIndex = selectedOptionIndex > 0 ? selectedOptionIndex - 1 : optionsCount - 1;
        updateSelection();
        speak(`Option ${selectedOptionIndex + 1}: ${currentQuestion.options[selectedOptionIndex]}`);
      }
      break;

    case 'arrowdown':
    case 's':
      e.preventDefault();
      if (!isAnswered) {
        selectedOptionIndex = (selectedOptionIndex + 1) % optionsCount;
        updateSelection();
        speak(`Option ${selectedOptionIndex + 1}: ${currentQuestion.options[selectedOptionIndex]}`);
      }
      break;

    case 'enter':
      e.preventDefault();
      if (!isAnswered) submitAnswer();
      break;

    case ' ':
      e.preventDefault();
      if (!isAnswered) {
        speak(`Selected: ${currentQuestion.options[selectedOptionIndex]}`);
      }
      break;

    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
      e.preventDefault();
      if (!isAnswered) {
        const num = parseInt(e.key) - 1;
        if (num >= 0 && num < optionsCount) {
          selectedOptionIndex = num;
          updateSelection();
          speak(`Selected option ${num + 1}: ${currentQuestion.options[num]}`);
        }
      }
      break;

    case 'r':
      e.preventDefault();
      speak(`Question: ${currentQuestion.sentence}`, true);
      break;

    case 'n':
      e.preventDefault();
      if (isAnswered) {
        console.log('🖱️ N key pressed, loading next question');
        if (autoAdvanceTimeout) {
          clearTimeout(autoAdvanceTimeout);
          autoAdvanceTimeout = null;
        }
        getContent();
      } else {
        speak('Please answer the current question first.');
      }
      break;

    case 'h':
      e.preventDefault();
      speak('Use arrow keys to navigate. Press Enter to submit. Press R to repeat question. Press N to go to next question after answering. Press 1-5 to select options.', true);
      break;
  }
}

async function testAuth() {
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');

  try {
    loading.style.display = 'block';
    error.style.display = 'none';

    const res = await fetch('/api/test-auth');
    const data = await res.json();

    loading.style.display = 'none';

    if (data.status === 'success') {
      await speak('Authentication test successful!');
      console.log('✅ Auth test passed:', data);
    } else {
      throw new Error(data.message || 'Authorization failed');
    }
  } catch (err) {
    loading.style.display = 'none';
    const errorMessage = getErrorMessage(err);
    error.textContent = `Auth test failed: ${errorMessage}`;
    error.style.display = 'block';
    await speak('Authentication test failed.');
  }
}

async function testEndpoint() {
  try {
    const res = await fetch('/api/content-tags');
    const data = await res.json();
    console.log('📊 Available tags:', data);
    await speak(`API endpoint working. ${data.count} content tags available.`);
  } catch (err) {
    console.error('❌ Endpoint test failed:', err);
    await speak(`Endpoint test failed: ${getErrorMessage(err)}`);
  }
}

function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  const status = document.getElementById('voice-status');
  if (status) status.textContent = voiceEnabled ? 'ON' : 'OFF';
  if (voiceEnabled) speak('Voice enabled');
}

function toggleDebug() {
  debugMode = !debugMode;
  const debugInfo = document.getElementById('debug-info');
  if (debugInfo) debugInfo.style.display = debugMode ? 'block' : 'none';
  if (voiceEnabled) speak(debugMode ? 'Debug mode enabled' : 'Debug mode disabled');
}

function playAudio() {
  const audio = document.getElementById('announcementAudio');
  if (audio && audio.src) {
    audio.play().catch(err => {
      console.error('❌ Audio play failed:', err);
      speak(`Audio playback failed: ${getErrorMessage(err)}`);
    });
  } else {
    speak('No audio available');
  }
}

async function viewAllQuestions() {
  try {
    const res = await fetch('/api/all-questions');
    const data = await res.json();
    console.log('📊 All Generated Questions:', data);

    if (data.content && data.content.length > 0) {
      await speak(`Found ${data.totalQuestions} questions total. Check console for details.`);
      if (debugMode) {
        const debugInfo = document.getElementById('debug-info');
        if (debugInfo) {
          document.getElementById('debug-content').textContent = JSON.stringify(data, null, 2);
          debugInfo.style.display = 'block';
        }
      }
    } else {
      await speak('No questions found in the system.');
    }
  } catch (err) {
    console.error('❌ Failed to fetch all questions:', err);
    await speak(`Failed to get all questions: ${getErrorMessage(err)}`);
  }
}


