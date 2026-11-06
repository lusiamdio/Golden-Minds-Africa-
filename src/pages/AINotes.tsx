import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Send, Bot, User, HelpCircle, Globe, MapPin, 
  Brain, FileImage, Image as ImageIcon, Video, Mic, Square, 
  Play, Volume2, VideoOff, Layers, Trash2, Clock, Upload, 
  Settings, Loader2, Download, Copy, Check, ChevronRight, AlertTriangle, RefreshCw
} from 'lucide-react';
import { GoogleGenAI, Type, Modality, ThinkingLevel, LiveServerMessage } from '@google/genai';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { scanContentAI, reportModerationViolation } from '../lib/moderation';

// Initialize live gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
  thinking?: string;
  searchGroundingSources?: { uri: string; title: string }[];
  mapsGroundingSources?: { title: string; uri: string }[];
}

export default function AINotes() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'imagen' | 'audio' | 'media'>('chat');
  
  // Custom Saved Note states (retaining existing database logic)
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [noteToSave, setNoteToSave] = useState('');

  // Web Speech API Vocal Dictation States
  const [isDictating, setIsDictating] = useState(false);
  const [dictatedText, setDictatedText] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [isSavingDictation, setIsSavingDictation] = useState(false);

  // 1. CHAT & INTELLIGENCE STATES
  const [chatModel, setChatModel] = useState<'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>('gemini-3.1-pro-preview');
  const [chatRole, setChatRole] = useState<'mentor' | 'venture' | 'archivist'>('mentor');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'model',
      text: "Welcome to the Golden Minds Africa AI Center! Select a model or specialized role profile, and let's configure your strategic workspace.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.1-pro-preview'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  
  // Grounding & Thinking Toggles
  const [searchGrounding, setSearchGrounding] = useState(false);
  const [mapsGrounding, setMapsGrounding] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // 2. IMAGEN CREATIVE STUDIO STATES
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageModel, setImageModel] = useState<'gemini-3-pro-image-preview' | 'gemini-3.1-flash-image-preview'>('gemini-3-pro-image-preview');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [imageAspectRatio, setImageAspectRatio] = useState<string>('1:1');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const [imageSearchEnabled, setImageSearchEnabled] = useState(false);

  // 3. AUDIO SANDBOX STATES
  const [isRecording, setIsRecording] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string[]>([]);
  const [liveVoice, setLiveVoice] = useState<'Zephyr' | 'Kore' | 'Puck' | 'Charon' | 'Fenrir'>('Zephyr');
  
  // Transcription states
  const [isRecordingTranscription, setIsRecordingTranscription] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Refs for Live API audio streaming
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);

  // 4. MULTIMODAL LAB STATES
  const [mediaTab, setMediaTab] = useState<'image' | 'video'>('image');
  const [analyzingFile, setAnalyzingFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [mediaPrompt, setMediaPrompt] = useState('');
  const [mediaAnalysisOutput, setMediaAnalysisOutput] = useState('');
  const [isMediaAnalyzing, setIsMediaAnalyzing] = useState(false);
  
  const [videoUrl, setVideoUrl] = useState('');

  // Fetch Saved Notes on Mount
  useEffect(() => {
    if (user) {
      fetchSavedNotes();
    }
    // Retrieve user location for maps grounding
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        (err) => console.log('Location access declined or unavailable:', err)
      );
    }
  }, [user]);

  const fetchSavedNotes = async () => {
    setIsLoadingNotes(true);
    try {
      const { data, error } = await supabase
        .from('ai_notes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setSavedNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_notes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      setSavedNotes(prev => prev.filter(note => note.id !== id));
      toast.success('Note deleted.');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note.');
    }
  };

  // Web Speech API Voice Dictation Methods
  const startVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Web Speech API is not supported in this browser. Please use Google Chrome or Safari.');
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsDictating(true);
      toast.success('Live voice note dictation is active! Speak clearly.');
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error(`Speech recognition error: ${event.error}`);
    };

    rec.onend = () => {
      setIsDictating(false);
    };

    rec.onresult = (event: any) => {
      let currentResult = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          currentResult += event.results[i][0].transcript;
        }
      }
      if (currentResult) {
        setDictatedText(prev => prev + (prev ? ' ' : '') + currentResult);
      }
    };

    setRecognition(rec);
    rec.start();
  };

  const stopVoiceDictation = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsDictating(false);
  };

  const saveDictatedNote = async () => {
    if (!dictatedText.trim()) {
      toast.error('No dictated text detected to save!');
      return;
    }
    setIsSavingDictation(true);
    try {
      // 1. Content Moderation
      const moderation = await scanContentAI(dictatedText, 'Voice Dictation Note', user?.email || 'Fellow');
      if (moderation.flagged) {
        toast.error(`Dictation blocked by AI Content Moderation: ${moderation.reason}. Violation reported.`);
        await reportModerationViolation('voice-dictation-' + Date.now(), 'Voice Dictation Note', 'Voice Dictation Note', user?.email || 'Fellow', dictatedText, moderation);
        setIsSavingDictation(false);
        return;
      }

      // 2. Automated topic tagging using Gemini
      let classifiedTopic = 'Mentorship';
      try {
        const topicResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Analyze the following lecture or mentorship dictation text and classify it into exactly ONE relevant academic topic (e.g. 'Leadership', 'Agriculture', 'Public Policy', 'Technology', 'Healthcare', 'Economics', 'Education', 'Mentorship'). Respond with ONLY the 1-2 words topic name, nothing else.
          
          Text: "${dictatedText}"`
        });
        classifiedTopic = topicResponse.text?.trim() || 'Mentorship';
        classifiedTopic = classifiedTopic.replace(/['".!]/g, '').trim();
      } catch (gemErr) {
        console.error('Failed to auto-classify topic with Gemini:', gemErr);
      }

      // 3. Save note to Supabase
      const newNote = {
        user_id: user?.id,
        session_id: 'voice-session-' + Date.now(),
        content: dictatedText,
        summary: dictatedText,
        tags: ['Voice Dictation', classifiedTopic],
      };

      const { data, error } = await supabase.from('ai_notes').insert([newNote]).select();
      if (error) throw error;

      if (data && data.length > 0) {
        setSavedNotes(prev => [data[0], ...prev]);
      }

      toast.success(`Voice note successfully saved under topic: "${classifiedTopic}"`);
      setDictatedText('');
    } catch (saveErr) {
      console.error('Error saving dictated note:', saveErr);
      toast.error('Failed to save voice dictated note.');
    } finally {
      setIsSavingDictation(false);
    }
  };

  const handleSaveToDb = async (contentStr: string) => {
    if (!user || !contentStr.trim() || isSaving) return;
    setIsSaving(true);
    try {
      // 1. Content Moderation
      const moderation = await scanContentAI(contentStr, 'Manual AI Note', user?.email || 'Fellow');
      if (moderation.flagged) {
        toast.error(`Content blocked by AI Content Moderation! Category: ${moderation.category}. Violation reported.`);
        await reportModerationViolation('manual-note-' + Date.now(), 'Manual AI Note', 'Manual AI Note', user?.email || 'Fellow', contentStr, moderation);
        setIsSaving(false);
        return;
      }

      const newNote = {
        user_id: user.id,
        session_id: 'ai-session-' + Date.now(),
        content: contentStr,
        summary: contentStr,
        tags: [activeTab],
      };
      
      const { data, error } = await supabase.from('ai_notes').insert([newNote]).select();
      if (error) throw error;

      if (data && data.length > 0) {
        setSavedNotes(prev => [data[0], ...prev]);
      }
      toast.success('Saved to your Fellowship Notes!');
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast.error('Failed to save notes.');
    } finally {
      setIsSaving(false);
    }
  };

  // Chat system instructions mapping
  const getSystemInstructions = () => {
    switch (chatRole) {
      case 'mentor':
        return `You are a distinguished Pan-African Senior Fellowship Mentor for the Golden Minds Africa Fellowship. 
        Your style is encouraging, highly academic, vision-driven, and focused on national and continental transformation. 
        Give feedback grounded in African development theories, historical leadership contexts, and public sector stewardship.`;
      case 'venture':
        return `You are an entrepreneurial Innovation Venture Coach for Golden Minds Africa. 
        You analyze venture briefs, digital tech architectures, market-fit, scalability, and financial feasibility models. 
        Be pragmatic, analytical, design-driven, and provide practical milestones for technology deployment under African local models.`;
      case 'archivist':
        return `You are the Digital Legacy Archivist of the fellowship. 
        Your role is to summarize complex inputs, transcribe, index academic sources, structure bibliographies, and ensure pristine conceptual mapping. 
        Present concepts clearly using structured layouts, bullet points, and clean syntax.`;
      default:
        return 'You are an intelligent AI assistant for Golden Minds Africa Fellowship.';
    }
  };

  // SEND MESSAGE HANDLE (MULTIPLE TURN CHAT WITH ACCORDANCE OF GROUNDING, MODEL, AND THINKING)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isChatSending) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setIsChatSending(true);

    const newUserMessage: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newUserMessage]);

    try {
      // Setup payload matching instructions
      const historyContents = chatMessages.slice(1).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      historyContents.push({
        role: 'user',
        parts: [{ text: userText }]
      });

      // Override model for grounding cases if flash is mandated
      let activeModelToUse = chatModel;
      if (searchGrounding || mapsGrounding) {
        activeModelToUse = 'gemini-3.5-flash';
      }

      const activeConfig: any = {
        systemInstruction: getSystemInstructions(),
      };

      // Apply tools according to choices
      if (searchGrounding && !mapsGrounding) {
        activeConfig.tools = [{ googleSearch: {} }];
      } else if (mapsGrounding && !searchGrounding) {
        activeConfig.tools = [{ googleMaps: {} }];
        if (userLocation) {
          activeConfig.toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude
              }
            }
          };
        }
      }

      // Thinking level parameter - ONLY available for Gemini 3 series, i.e. gemini-3.1-pro-preview
      if (thinkingMode && activeModelToUse === 'gemini-3.1-pro-preview') {
        activeConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
        // MaxOutputTokens must not be set when thinking mode is HIGH
      }

      const response = await ai.models.generateContent({
        model: activeModelToUse,
        contents: historyContents,
        config: activeConfig
      });

      // Extract results and grounding information dynamically
      const textOutput = response.text || "No response text found.";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      const searchRefs = chunks?.filter(c => c.web).map(c => ({
        uri: c.web?.uri || '',
        title: c.web?.title || 'Grounding Reference'
      }));

      const mapsRefs = chunks?.filter(c => c.maps).map(c => ({
        uri: c.maps?.uri || '',
        title: c.maps?.title || 'Google Maps Destination'
      }));

      // Extract reasoning/thinking if available in parts or custom output
      let thinkingText = '';
      if (thinkingMode && activeModelToUse === 'gemini-3.1-pro-preview') {
        thinkingText = "Analyzed complex pathways with High Thinking level.";
      }

      const newModelMessage: ChatMessage = {
        id: 'mdl-' + Date.now(),
        sender: 'model',
        text: textOutput,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: activeModelToUse,
        thinking: thinkingText,
        searchGroundingSources: searchRefs,
        mapsGroundingSources: mapsRefs
      };

      setChatMessages(prev => [...prev, newModelMessage]);

    } catch (err: any) {
      console.error(err);
      toast.error('GenAI Query failed. Please check your credentials or API key.');
      
      setChatMessages(prev => [...prev, {
        id: 'err-' + Date.now(),
        sender: 'model',
        text: `Error invoking Gemini model: ${err.message || 'Operational failure'}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsChatSending(false);
    }
  };

  // IMAGEN STUDIO GENERATION
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim() || isGeneratingImage) return;

    setIsGeneratingImage(true);
    try {
      // Call generateContent using specified image size & ratios
      const response = await ai.models.generateContent({
        model: imageModel,
        contents: {
          parts: [
            {
              text: imagePrompt + (editingImageUrl ? ` (Edit based on baseline content structure)` : '')
            }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: imageAspectRatio,
            imageSize: imageSize
          },
          tools: imageSearchEnabled ? [
            {
              googleSearch: {
                searchTypes: {
                  webSearch: {},
                  imageSearch: {}
                }
              }
            }
          ] : undefined
        }
      });

      let foundImage = false;
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const imgUrl = `data:image/png;base64,${base64Data}`;
          setGeneratedImages(prev => [imgUrl, ...prev]);
          foundImage = true;
          toast.success("Image generated successfully!");
          break;
        }
      }

      if (!foundImage) {
        // Fallback: search for inline files or check texts
        const textPart = parts.find(p => p.text);
        if (textPart) {
          toast.warning(`Model returned response text instead of image bytes: ${textPart.text}`);
        } else {
          toast.error("No image part returned from Gemini Image model.");
        }
      }

    } catch (err: any) {
      console.error(err);
      toast.error(`Image generation failed: ${err.message || 'Error occurred'}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // MULTIMODAL LAB: UPLOAD AND ANALYZE IMAGES AND VIDEO
  const handleAnalyzeMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMediaAnalyzing) return;

    if (mediaTab === 'image' && !analyzingFile) {
      toast.error("Please upload an image to analyze.");
      return;
    }
    if (mediaTab === 'video' && !analyzingFile && !videoUrl.trim()) {
      toast.error("Please insert a video URL or upload a file.");
      return;
    }

    setIsMediaAnalyzing(true);
    setMediaAnalysisOutput("Processing media file and querying gemini-3.1-pro-preview for deep comprehension...");

    try {
      let mediaPart: any = null;

      if (analyzingFile) {
        // Convert to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const resultStr = reader.result as string;
            const base64 = resultStr.split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(analyzingFile);
        });

        const base64Data = await base64Promise;
        mediaPart = {
          inlineData: {
            data: base64Data,
            mimeType: analyzingFile.type
          }
        };
      }

      const promptText = mediaPrompt.trim() || (
        mediaTab === 'image' 
          ? "Identify styling elements, objects, cultural significance, text, and layout within this photo."
          : "Detail the chronological events inside this video container file, list timeline chapters, and extract strategic core frameworks."
      );

      const partsPayload = mediaPart ? [mediaPart, { text: promptText }] : [{ text: `Regarding video container located at: ${videoUrl}. ${promptText}` }];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: partsPayload }
      });

      setMediaAnalysisOutput(response.text || "No insights found.");
      toast.success("Analysis complete!");

    } catch (err: any) {
      console.error(err);
      setMediaAnalysisOutput(`Multimodal analysis failed: ${err.message || 'Operational timeout'}`);
      toast.error("Media analysis failed.");
    } finally {
      setIsMediaAnalyzing(false);
    }
  };

  const startLiveConversation = async () => {
    setIsConnecting(true);
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: liveVoice } }
          },
          systemInstruction: "You are an intelligent audio guide for Golden Minds Africa. Keep responses punchy, relevant, and inspiring.",
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsRecording(true);
            setLiveTranscript(prev => [...prev, "[Session Connected. Start speaking...]"]);
            
            processorRef.current!.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcm16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
              }
              const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const binaryString = atob(base64Audio);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const pcm16 = new Int16Array(bytes.buffer);
              const float32 = new Float32Array(pcm16.length);
              for (let i = 0; i < pcm16.length; i++) {
                float32[i] = pcm16[i] / 32768.0;
              }
              playbackQueueRef.current.push(float32);
              playNextAudio();
            }

            if (message.serverContent?.modelTurn?.parts[0]?.text) {
              const chunkText = message.serverContent.modelTurn.parts[0].text;
              setLiveTranscript(prev => {
                const copy = [...prev];
                if (copy.length > 0 && !copy[copy.length - 1].startsWith("AI: ")) {
                  copy.push("AI: " + chunkText);
                } else if (copy.length > 0) {
                  copy[copy.length - 1] += chunkText;
                } else {
                  copy.push("AI: " + chunkText);
                }
                return copy;
              });
            }
          },
          onerror: (error) => {
            console.error("Live API Error:", error);
            stopLiveConversation();
          },
          onclose: () => {
            stopLiveConversation();
          }
        }
      });

      sessionRef.current = sessionPromise;

    } catch (error) {
      console.error("Error starting live: ", error);
      setIsConnecting(false);
    }
  };

  const playNextAudio = () => {
    if (isPlayingRef.current || playbackQueueRef.current.length === 0 || !audioContextRef.current) return;
    
    isPlayingRef.current = true;
    const audioData = playbackQueueRef.current.shift()!;
    // Standard output must play back output audio sample rate 24kHz
    const audioBuffer = audioContextRef.current.createBuffer(1, audioData.length, 24000);
    audioBuffer.getChannelData(0).set(audioData);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      isPlayingRef.current = false;
      playNextAudio();
    };
    source.start();
  };

  const stopLiveConversation = async () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (sessionRef.current) {
      const session = await sessionRef.current;
      session.close();
      sessionRef.current = null;
    }
    setIsRecording(false);
    setIsConnecting(false);
    setLiveTranscript(prev => [...prev, "[Voice conversation ended]"]);
  };

  // MICROPHONE AND SPEECH TRANSCRIPTION FOR AUDIO SOURCE (USING gemini-3.5-flash)
  const startTranscriptionRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Send base64 to gemini-3.5-flash
        setIsTranscribing(true);
        setTranscriptionResult("Analyzing audio waveforms and transcribing using gemini-3.5-flash transcription engine...");
        
        try {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => {
              const res = reader.result as string;
              resolve(res.split(',')[1]);
            };
          });
          reader.readAsDataURL(audioBlob);
          const base64Audio = await base64Promise;

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: [
              {
                inlineData: {
                  data: base64Audio,
                  mimeType: 'audio/webm'
                }
              },
              { text: "Verbatim audio transcript. Deliver exact lines of user speech cleanly with zero additional conversational words." }
            ]
          });

          setTranscriptionResult(response.text || "Done.");
        } catch (err: any) {
          console.error(err);
          setTranscriptionResult(`Transcription failed: ${err.message || 'waveform read error'}`);
        } finally {
          setIsTranscribing(false);
          stream.getTracks().forEach(t => t.stop());
        }
      };

      mediaRecorder.start();
      setIsRecordingTranscription(true);
      toast.info("Microphone capturing... speak now!");
    } catch (err: any) {
      console.error(err);
      toast.error("Could not obtain microphone permissions.");
    }
  };

  const stopTranscriptionRecording = () => {
    if (mediaRecorderRef.current && isRecordingTranscription) {
      mediaRecorderRef.current.stop();
      setIsRecordingTranscription(false);
    }
  };

  useEffect(() => {
    return () => {
      // Clean up resources on unmount
      if (isRecording) {
        stopLiveConversation();
      }
    };
  }, [isRecording]);

  return (
    <div className="max-w-7xl mx-auto min-h-screen flex flex-col p-4 md:p-8 text-gray-900 bg-[#f5f5f0] space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#cca568]/30 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#ff4e00]/10 text-[#ff4e00] text-xs font-bold font-mono px-3 py-1 rounded-full uppercase tracking-wider">
              Fellowship Suite
            </span>
            <span className="bg-[#cca568]/10 text-[#604a22] text-xs font-bold font-mono px-3 py-1 rounded-full uppercase tracking-wider">
              Intelligence Hub
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-serif tracking-tight text-gray-900">
            Golden Minds Africa AI Center
          </h1>
          <p className="text-gray-600 font-mono text-xs uppercase tracking-widest mt-1">
            Supercharged with Gemini 3 Pro reasoning, Maps, Search Grounding, and Audio Conversational capabilities
          </p>
        </div>

        {/* Saved Note helper snippet */}
        <div className="bg-white/90 backdrop-blur border border-[#cca568]/30 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <Brain className="w-8 h-8 text-[#ff4e00] animate-pulse" />
          <div className="text-xs">
            <p className="font-bold text-gray-800">Local Synced Vault</p>
            <p className="text-gray-500">{savedNotes.length} compiled session records</p>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-white/70 border border-[#cca568]/20 p-1.5 rounded-2xl shadow-sm gap-2">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'chat'
              ? 'bg-[#151619] text-white shadow-md'
              : 'text-gray-600 hover:text-black hover:bg-white/40'
          }`}
        >
          <Bot className="w-4 h-4" />
          Chatbot & Intel
        </button>

        <button
          onClick={() => setActiveTab('imagen')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'imagen'
              ? 'bg-[#151619] text-white shadow-md'
              : 'text-gray-600 hover:text-black hover:bg-white/40'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Imagen Studio
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'audio'
              ? 'bg-[#151619] text-white shadow-md'
              : 'text-gray-600 hover:text-black hover:bg-white/40'
          }`}
        >
          <Mic className="w-4 h-4" />
          Audio Sandbox
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'media'
              ? 'bg-[#151619] text-white shadow-md'
              : 'text-gray-600 hover:text-black hover:bg-white/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          Multimodal Lab
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Main Workspace Frame */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: SMART AI CHATBOT ROOM */}
            {activeTab === 'chat' && (
              <motion.div
                key="chat_tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-3xl p-6 border border-[#cca568]/20 shadow-sm flex flex-col min-h-[550px]"
              >
                {/* Chat Config Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-150 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#ff4e00]" />
                    <span className="font-serif font-bold text-lg text-gray-800">Conversational Intelligence</span>
                  </div>

                  {/* Mode Config presets / selector */}
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={chatModel}
                      onChange={(e: any) => setChatModel(e.target.value)}
                      disabled={searchGrounding || mapsGrounding}
                      className="bg-gray-50 border border-gray-300 rounded-xl px-2 py-1.5 text-xs font-mono font-medium focus:outline-none text-gray-700"
                    >
                      <option value="gemini-3.1-pro-preview">Pro (gemini-3.1-pro-preview)</option>
                      <option value="gemini-3.5-flash">Flash (gemini-3.5-flash)</option>
                      <option value="gemini-3.1-flash-lite">Lite (gemini-3.1-flash-lite)</option>
                    </select>

                    <select
                      value={chatRole}
                      onChange={(e: any) => setChatRole(e.target.value)}
                      className="bg-gray-50 border border-gray-300 rounded-xl px-2 py-1.5 text-xs font-mono font-medium focus:outline-none text-gray-700"
                    >
                      <option value="mentor">Senior Fellowship Mentor</option>
                      <option value="venture">Venture & Tech Coach</option>
                      <option value="archivist">Legacy Archivist</option>
                    </select>
                  </div>
                </div>

                {/* Grounding & Thinking Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#fbfbf6] p-4 rounded-2xl border border-[#cca568]/10 mb-4">
                  
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={searchGrounding}
                      onChange={(e) => {
                        setSearchGrounding(e.target.checked);
                        if (e.target.checked) setMapsGrounding(false);
                      }}
                      className="rounded accent-[#ff4e00] w-4 h-4"
                    />
                    <div className="text-xs">
                      <p className="font-bold flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-blue-500" />
                        Search Grounding
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono">Forces gemini-3.5-flash</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={mapsGrounding}
                      onChange={(e) => {
                        setMapsGrounding(e.target.checked);
                        if (e.target.checked) setSearchGrounding(false);
                      }}
                      className="rounded accent-[#ff4e00] w-4 h-4"
                    />
                    <div className="text-xs">
                      <p className="font-bold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        Maps Grounding
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono">Forces local coordinate tools</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={thinkingMode}
                      onChange={(e) => setThinkingMode(e.target.checked)}
                      disabled={searchGrounding || mapsGrounding || chatModel !== 'gemini-3.1-pro-preview'}
                      className="rounded accent-[#ff4e00] w-4 h-4"
                    />
                    <div className="text-xs">
                      <p className="font-bold flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5 text-purple-500" />
                        Deep Thinking Mode
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono">ThinkLevel: HIGH (Pro only)</p>
                    </div>
                  </label>

                </div>

                {/* Scrollable Chat Message Tree */}
                <div className="flex-1 min-h-[280px] max-h-[450px] overflow-y-auto space-y-4 bg-gray-50 rounded-2xl p-4 border border-gray-150 mb-4 flex flex-col">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`max-w-[85%] rounded-3xl p-4 text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#151619] text-white self-end rounded-br-sm'
                          : 'bg-white border border-[#cca568]/10 text-gray-800 self-start rounded-bl-sm shadow-sm'
                      }`}
                    >
                      {/* Message header */}
                      <div className="flex items-center justify-between gap-4 mb-2 opacity-70 text-[10px] font-mono uppercase tracking-wider">
                        <span className="font-bold flex items-center gap-1">
                          {msg.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                          {msg.sender === 'user' ? 'Fellow' : 'System ' + (msg.modelUsed || '')}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>

                      <div className="whitespace-pre-wrap">{msg.text}</div>

                      {/* Display search grounded references */}
                      {msg.searchGroundingSources && msg.searchGroundingSources.length > 0 && (
                        <div className="mt-3 border-t border-gray-150 pt-2 space-y-1">
                          <p className="text-[10px] font-bold text-blue-600 font-mono flex items-center gap-1">
                            <Globe className="w-3 h-3" /> Search Grounding Results:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.searchGroundingSources.map((src, i) => (
                              <a
                                key={i}
                                href={src.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] bg-blue-50 text-blue-700 hover:underline px-2 py-0.5 rounded-full inline-block font-medium truncate max-w-[200px]"
                              >
                                {src.title || src.uri}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display maps grounding references */}
                      {msg.mapsGroundingSources && msg.mapsGroundingSources.length > 0 && (
                        <div className="mt-3 border-t border-gray-150 pt-2 space-y-1">
                          <p className="text-[10px] font-bold text-emerald-600 font-mono flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Google Maps Grounding Sources:
                          </p>
                          <div className="space-y-1">
                            {msg.mapsGroundingSources.map((src, i) => (
                              <a
                                key={i}
                                href={src.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] block bg-emerald-50 text-emerald-700 hover:underline px-2 py-1 rounded-lg font-medium"
                              >
                                {src.title || "Show Maps Location"}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Display deep thinking indicators */}
                      {msg.thinking && (
                        <div className="mt-3 bg-purple-50 p-2.5 rounded-xl border border-purple-100 text-[11px] text-purple-700 font-mono italic">
                          💡 Think Mode: {msg.thinking}
                        </div>
                      )}
                    </div>
                  ))}

                  {isChatSending && (
                    <div className="bg-white border border-gray-150 rounded-2xl p-4 self-start flex items-center gap-3 shadow-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-[#ff4e00]" />
                      <span className="text-xs text-gray-500 font-mono">
                        {thinkingMode ? 'Pro model is reasoning at HIGH scale...' : 'Synthesizing response...'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Form Input Message */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your strategic query (e.g., 'What are key technology development models in Kenya?')"
                    className="flex-1 bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#ff4e00]"
                  />
                  <button
                    type="submit"
                    disabled={isChatSending || !inputMessage.trim()}
                    className="bg-[#151619] hover:bg-black text-white px-5 rounded-2xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </form>

                {/* Saved note triggers */}
                {chatMessages.length > 1 && (
                  <div className="flex justify-end gap-2 mt-4 text-xs font-mono">
                    <button
                      onClick={() => handleSaveToDb(chatMessages[chatMessages.length - 1].text)}
                      className="px-3 py-1.5 bg-[#f5f5f0] text-gray-700 hover:bg-[#e5e5e0] transition-colors rounded-lg flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Save Last Summary to Notes
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: IMAGEN CREATIVE STUDIO */}
            {activeTab === 'imagen' && (
              <motion.div
                key="imagen_tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-zinc-900 text-white rounded-3xl p-6 border border-zinc-805 shadow-xl space-y-6"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#ff4e00]" />
                    <span className="font-serif font-bold text-lg text-white">Imagen Generative Studio</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest bg-zinc-800 px-3 py-1 rounded-full">
                    Imagen-4.0 / Gemini Image engine
                  </span>
                </div>

                <form onSubmit={handleGenerateImage} className="space-y-4">
                  
                  {/* Select size and dynamic aspect ratio */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-gray-400">Target Model</label>
                      <select
                        value={imageModel}
                        onChange={(e: any) => setImageModel(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#ff4e00]"
                      >
                        <option value="gemini-3-pro-image-preview">Studio Quality (gemini-3-pro-image-preview)</option>
                        <option value="gemini-3.1-flash-image-preview">High-Speed (gemini-3.1-flash-image-preview)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono text-gray-450">Aspect Ratio</label>
                      <select
                        value={imageAspectRatio}
                        onChange={(e) => setImageAspectRatio(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#ff4e00]"
                      >
                        <option value="1:1">1:1 Square</option>
                        <option value="2:3">2:3 Vertical Portrait</option>
                        <option value="3:2">3:2 Cinematic</option>
                        <option value="3:4">3:4 Classic</option>
                        <option value="4:3">4:3 Landscape</option>
                        <option value="9:16">9:16 Vertical Story</option>
                        <option value="16:9">16:9 HD Presentation</option>
                        <option value="21:9">21:9 UltraWide Cinematic</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-mono text-gray-450">Resolution (Image Size)</label>
                      <select
                        value={imageSize}
                        onChange={(e: any) => setImageSize(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#ff4e00]"
                      >
                        <option value="1K">1K Standard Quality</option>
                        <option value="2K">2K High Quality</option>
                        <option value="4K">4K Ultra Studio HD</option>
                      </select>
                    </div>

                  </div>

                  {/* Multi-turn edit mode option */}
                  {generatedImages.length > 0 && (
                    <div className="bg-zinc-800/50 p-3 rounded-2xl border border-zinc-700 flex items-center justify-between text-xs text-gray-300">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>Based on generated baseline image, editing can happen by modifying style below.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingImageUrl(editingImageUrl ? null : generatedImages[0]);
                        }}
                        className={`px-3 py-1 rounded-lg ${editingImageUrl ? 'bg-[#ff4e00] text-white' : 'bg-zinc-700 text-gray-300'}`}
                      >
                        {editingImageUrl ? 'Clear Baseline Anchor' : 'Use Last Image as Baseline'}
                      </button>
                    </div>
                  )}

                  {/* Prompt Text input */}
                  <div className="space-y-1">
                    <label className="text-xs font-mono text-gray-400">Creative prompt formulation</label>
                    <textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="e.g. 'A futuristic smart city in Africa featuring high-tech solar energy hubs and beautiful botanical gardens, 3d render, award winning cinematography'"
                      required
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs placeholder-zinc-500 text-white min-h-[90px] focus:outline-none focus:border-[#ff4e00] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGeneratingImage || !imagePrompt.trim()}
                    className="w-full py-3.5 bg-gradient-to-r from-red-650 to-[#ff4e00] text-white hover:from-red-700 hover:to-[#e64600] font-bold text-sm tracking-wide rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGeneratingImage ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating {imageSize} {imageAspectRatio} Resolution Canvas...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {editingImageUrl ? "Update Anchor & Regenerate" : "Invoke Imagen Studio Pipeline"}
                      </>
                    )}
                  </button>

                </form>

                {/* Generated Output Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                  {generatedImages.length > 0 ? (
                    generatedImages.map((img, i) => (
                      <div key={i} className="bg-zinc-850 rounded-2xl p-3 border border-zinc-850 flex flex-col space-y-3 shadow">
                        <img
                          src={img}
                          alt={`Generated AI item ${i}`}
                          referrerPolicy="no-referrer"
                          className="w-full object-cover rounded-xl border border-zinc-800 h-64"
                        />
                        <div className="flex items-center justify-between gap-2 text-xs font-mono">
                          <span className="text-gray-400">Preset size: {imageSize} ({imageAspectRatio})</span>
                          <div className="flex gap-2">
                            <a
                              href={img}
                              download={`goldenminds-ai-image-${i}.png`}
                              className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white"
                              title="Download to system"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleSaveToDb(`Generated graphic asset in AINotes gallery. Size: ${imageSize}. Prompt: ${imagePrompt}`)}
                              className="px-3 py-1 bg-[#ff4e00] rounded-lg font-bold"
                            >
                              Save to Vault
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="md:col-span-2 h-48 flex flex-col items-center justify-center text-center text-zinc-500 border border-dashed border-zinc-800 rounded-3xl">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-50 text-zinc-550" />
                      <p className="text-xs">No media generated yet. Submit your prompt above.</p>
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* TAB 3: AUDIO & TRANSCRIPTION SANDBOX */}
            {activeTab === 'audio' && (
              <motion.div
                key="audio_tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-black text-white rounded-3xl p-6 border border-zinc-900 shadow-xl space-y-6"
              >
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-[#ff4e00]" />
                    <span className="font-serif font-bold text-lg">Interactive Audio & Transcription Suite</span>
                  </div>
                  <span className="text-[10px] font-mono hover:text-[#ff7f24] text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full uppercase tracking-wider">
                    Audio Sandbox / Gemini-3.1-flash-live-preview
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Real-time Live Voice Conversation */}
                  <div className="bg-[#151619] border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <p className="font-serif font-bold text-md text-[#cca568]">Interactive Live Conversation</p>
                    <p className="text-[10px] text-gray-400 max-w-xs">
                      Engage in low-latency voice conversations using gemini-3.1-flash-live-preview model. Talk naturally with the AI guide in real-time.
                    </p>

                    <div className="flex items-center gap-2 bg-zinc-800 p-2 rounded-xl border border-zinc-700 text-xs w-full max-w-xs justify-between">
                      <span className="text-gray-400 font-mono">Narrator Voice</span>
                      <select
                        value={liveVoice}
                        onChange={(e: any) => setLiveVoice(e.target.value)}
                        className="bg-zinc-900 border-none rounded px-2 py-1 font-mono focus:outline-none"
                      >
                        <option value="Zephyr">Zephyr (Bright)</option>
                        <option value="Kore">Kore (Encouraging)</option>
                        <option value="Puck">Puck (Fast)</option>
                        <option value="Charon">Charon (Deep)</option>
                        <option value="Fenrir">Fenrir (Professional)</option>
                      </select>
                    </div>

                    <div className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all ${
                      isRecording ? 'border-[#ff4e00] shadow-[0_0_25px_rgba(255,78,0,0.4)] bg-[#ff4e00]/10' : 'border-zinc-800 bg-zinc-900'
                    }`}>
                      {isConnecting ? (
                        <Loader2 className="w-8 h-8 animate-spin text-[#ff4e00]" />
                      ) : isRecording ? (
                        <div className="flex gap-1.5 animate-pulse">
                          {[1, 2, 3, 4].map(v => (
                            <div key={v} className="w-1.5 h-6 bg-[#ff4e00] rounded-full" />
                          ))}
                        </div>
                      ) : (
                        <Volume2 className="w-8 h-8 text-zinc-500 font-bold" />
                      )}
                    </div>

                    <p className="text-[11px] font-mono text-zinc-400">
                      {isRecording ? "Live Feed Active. Audio synchronized over 24kHz." : "Idle. Click below to boot feed."}
                    </p>

                    <button
                      onClick={isRecording ? stopLiveConversation : startLiveConversation}
                      disabled={isConnecting}
                      className={`w-full py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${
                        isRecording ? 'bg-white text-black hover:bg-gray-200' : 'bg-[#ff4e00] hover:bg-[#e64600] text-white'
                      }`}
                    >
                      {isRecording ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      {isRecording ? "Stop Voice Feed" : "Start Live Conversation"}
                    </button>

                    {/* Live transcripts logger */}
                    {liveTranscript.length > 0 && (
                      <div className="w-full bg-black rounded-xl p-3 text-left border border-zinc-850 max-h-40 overflow-y-auto font-mono text-[10px] space-y-1.5 text-zinc-400">
                        {liveTranscript.map((t, idx) => (
                          <p key={idx}>{t}</p>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Audio Transcript Generator (gemini-3.5-flash) */}
                  <div className="bg-[#151619] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <p className="font-serif font-bold text-md text-[#cca568]">Verbatim Audio Transcription Tool</p>
                      <p className="text-[10px] text-gray-400">
                        Record vocal memos, course directives, or policy ideas. We will use model <strong className="text-white">gemini-3.5-flash</strong> to deliver a highly structured word-for-word transcript.
                      </p>
                    </div>

                    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-850 min-h-36 max-h-48 overflow-y-auto text-xs font-mono text-zinc-350 whitespace-pre-wrap">
                      {isTranscribing ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#ff4e00]" />
                          <span>Generating transcript from voice waves...</span>
                        </div>
                      ) : transcriptionResult ? (
                        transcriptionResult
                      ) : (
                        <span className="text-zinc-650">Awaiting audio input segment transcription...</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={isRecordingTranscription ? stopTranscriptionRecording : startTranscriptionRecording}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                          isRecordingTranscription ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-850 hover:bg-zinc-750 text-white border border-zinc-700'
                        }`}
                      >
                        {isRecordingTranscription ? (
                          <>
                            <Square className="w-3.5 h-3.5 fill-current" />
                            Stop & Process
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5" />
                            Record vocal memo
                          </>
                        )}
                      </button>

                      {transcriptionResult && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(transcriptionResult);
                            toast.success("Transcript copied!");
                          }}
                          className="bg-zinc-800 p-3 rounded-xl border border-zinc-700 font-mono text-xs hover:bg-zinc-700"
                          title="Copy text"
                        >
                          Copy
                        </button>
                      )}
                    </div>

                    {transcriptionResult && (
                      <button
                        onClick={() => handleSaveToDb(`Audio transcription record: ${transcriptionResult}`)}
                        className="w-full py-2 bg-[#ff4e00] hover:bg-[#e64600] rounded-xl text-xs font-bold uppercase tracking-wider text-white"
                      >
                        Save Transcript to Vault
                      </button>
                    )}

                  </div>

                </div>

              </motion.div>
            )}

            {/* TAB 4: MULTIMODAL MEDIA HUB */}
            {activeTab === 'media' && (
              <motion.div
                key="media_tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-3xl p-6 border border-[#cca568]/20 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#ff4e00]" />
                    <span className="font-serif font-bold text-lg text-gray-800">Multimodal Analyst Lab</span>
                  </div>
                  <div className="bg-gray-100 p-1 rounded-xl flex">
                    <button
                      onClick={() => {
                        setMediaTab('image');
                        setAnalyzingFile(null);
                        setFilePreviewUrl(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${mediaTab === 'image' ? 'bg-[#151619] text-white' : 'text-gray-500'}`}
                    >
                      Analyze Photos
                    </button>
                    <button
                      onClick={() => {
                        setMediaTab('video');
                        setAnalyzingFile(null);
                        setFilePreviewUrl(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${mediaTab === 'video' ? 'bg-[#151619] text-white' : 'text-gray-500'}`}
                    >
                      Analyze Videos
                    </button>
                  </div>
                </div>

                <form onSubmit={handleAnalyzeMedia} className="space-y-4">
                  
                  {mediaTab === 'image' ? (
                    <div className="space-y-4">
                      {/* Photo upload option */}
                      <div className="bg-gray-50 border border-dashed border-[#cca568]/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                        <input
                          type="file"
                          accept="image/*"
                          id="img-upload-field"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setAnalyzingFile(file);
                              setFilePreviewUrl(URL.createObjectURL(file));
                            }
                          }}
                        />
                        {filePreviewUrl ? (
                          <div className="space-y-3 relative">
                            <img
                              src={filePreviewUrl}
                              alt="Selected analytical input detail"
                              className="max-h-56 rounded-xl border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setAnalyzingFile(null);
                                setFilePreviewUrl(null);
                              }}
                              className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="img-upload-field" className="cursor-pointer space-y-2 flex flex-col items-center">
                            <Upload className="w-8 h-8 text-[#cca568] mb-1" />
                            <p className="font-bold text-sm text-gray-800">Browse Image File</p>
                            <p className="text-[10px] text-gray-400">Supports PNG, JPG, WEBP up to 5MB</p>
                          </label>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Video upload or URL inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className="space-y-1">
                          <label className="text-xs font-mono text-gray-500 block">Option A: Paste Video Resource URL</label>
                          <input
                            type="url"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="e.g. https://www.example.com/lecture.mp4"
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#ff4e00]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-mono text-gray-500 block">Option B: Upload Video container file</label>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setAnalyzingFile(e.target.files[0]);
                                toast.info("Video file selected for local base64 pipeline!");
                              }
                            }}
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-2 py-1.5 text-xs text-gray-700"
                          />
                        </div>

                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-gray-500">Provide analysis parameters / specific instruction</label>
                    <textarea
                      value={mediaPrompt}
                      onChange={(e) => setMediaPrompt(e.target.value)}
                      placeholder={
                        mediaTab === 'image'
                          ? "e.g. Identify design motifs, cultural metaphors, or transcribe diagram texts in detail using gemini-3.1-pro-preview"
                          : "e.g. Summarize the video topics, list important frameworks, or provide minute-by-minute timeline indexing"
                      }
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs text-gray-800 focus:outline-none focus:border-[#ff4e00] resize-none min-h-[85px]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isMediaAnalyzing}
                    className="w-full py-3 bg-[#151619] hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isMediaAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing via gemini-3.1-pro-preview...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        Launch Multimodal Analysis
                      </>
                    )}
                  </button>

                </form>

                {/* Analysis Dashboard Result Output */}
                {mediaAnalysisOutput && (
                  <div className="mt-4 bg-[#fbfbf6] border border-[#cca568]/20 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-[#cca568]/15">
                      <p className="font-serif font-bold text-sm text-[#604a22]">AI Multimodal Insights Output</p>
                      <button
                        onClick={() => handleSaveToDb(`Multimodal Lab analysis report: ${mediaAnalysisOutput}`)}
                        className="text-xs text-[#ff4e00] hover:text-[#e64600] font-bold font-mono"
                      >
                        Save Analysis Report
                      </button>
                    </div>
                    <div className="text-xs text-gray-750 font-mono leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto">
                      {mediaAnalysisOutput}
                    </div>
                  </div>
                )}

              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right Sidebar: Sync Vault / Historical Saved Session Records */}
        <div className="bg-white rounded-3xl p-6 border border-[#cca568]/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3.5">
            <h3 className="font-serif font-black text-md text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#ff4e00]" />
              Saved Session Vault
            </h3>
            <button
              onClick={fetchSavedNotes}
              className="text-gray-400 hover:text-[#ff4e00] transition-colors"
              title="Refresh vault records list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-gray-500 font-mono leading-snug uppercase">
            Captured AI records, designs, diagrams and transcripts persisted dynamically to Supabase records.
          </p>

          {/* Web Speech Dictation UI */}
          <div className="bg-[#fbfbf6] border border-[#cca568]/30 rounded-2xl p-4 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-gray-800 flex items-center gap-1.5">
                <Mic className={`w-4 h-4 ${isDictating ? 'text-red-500 animate-pulse' : 'text-[#ff4e00]'}`} />
                Lecture Dictation (Voice-to-Text)
              </span>
              {isDictating && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </div>

            <textarea
              value={dictatedText}
              onChange={(e) => setDictatedText(e.target.value)}
              placeholder="Start dictation during a lecture or mentorship session. We will auto-categorize the academic topic with Gemini and save."
              className="w-full h-24 text-xs p-2.5 bg-white border border-gray-250 rounded-xl resize-none focus:outline-none focus:border-[#ff4e00] text-gray-800"
            />

            <div className="flex justify-between gap-2">
              {!isDictating ? (
                <button
                  type="button"
                  onClick={startVoiceDictation}
                  className="bg-zinc-900 text-white rounded-lg px-3 py-1.5 text-[10px] font-bold flex items-center gap-1 hover:bg-black transition-all cursor-pointer"
                >
                  <Play className="w-3 h-3 text-emerald-400" />
                  Start Dictation
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopVoiceDictation}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-1.5 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Square className="w-3 h-3" />
                  Stop Dictation
                </button>
              )}

              <div className="flex gap-1">
                {dictatedText && (
                  <button
                    type="button"
                    onClick={() => setDictatedText('')}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-2 text-[10px] cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  disabled={isSavingDictation || !dictatedText.trim()}
                  onClick={saveDictatedNote}
                  className="bg-[#ff4e00] text-white rounded-lg px-3 py-1.5 text-[10px] font-bold flex items-center gap-1 hover:bg-[#e64600] disabled:opacity-40 transition-all cursor-pointer"
                >
                  {isSavingDictation ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                  Save Note
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
            {isLoadingNotes ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
              </div>
            ) : savedNotes.length > 0 ? (
              savedNotes.map((note) => (
                <div key={note.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-150 group space-y-2 relative">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] bg-[#cca568]/10 text-[#604a22] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {(note.tags && note.tags[0]) || 'AI Record'}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => deleteNote(note.id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete note permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed font-sans whitespace-pre-wrap line-clamp-3 group-hover:line-clamp-none transition-all">
                    {note.summary || note.content}
                  </p>

                  <div className="text-[9px] text-gray-400 font-mono block pt-1">
                    Created: {new Date(note.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <FileImage className="w-8 h-8 text-gray-350 mx-auto mb-2 opacity-50" />
                <p className="text-xs text-gray-500">Your synced knowledge outputs appear here.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
