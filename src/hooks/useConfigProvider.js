import { useState, useEffect } from "react";
import { TelegramConfig } from "@/entities/all";

export function useConfigProvider() {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const configs = await TelegramConfig.list("-created_date", 1);
      if (configs.length > 0) {
        setConfig(configs[0]);
      }
    } catch (error) {
      // Error loading config
    }
    setIsLoading(false);
  };

  const handleSaveConfig = async (configData) => {
    try {
      if (config) {
        await TelegramConfig.update(config.id, configData);
      } else {
        await TelegramConfig.create(configData);
      }
      await loadConfig();
    } catch (error) {
      // Error saving config
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    isLoading,
    loadConfig,
    handleSaveConfig,
  };
}
