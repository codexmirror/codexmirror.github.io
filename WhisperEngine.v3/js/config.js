const config = {
  MAX_RITUAL_LOGS: 100,
  INVOCATION_LIMIT_WINDOW: 10000,
  FLINK_REPEAT_TRIGGER: 5,
  MAX_INVOCATIONS: 10,
  KAI_SOUND_SRC: 'media/kai.glitch.mp3'
};

if (typeof module !== 'undefined' && module.exports) module.exports = config;
if (typeof window !== 'undefined') window.config = config;
