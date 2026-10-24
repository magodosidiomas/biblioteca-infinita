import React, { useState, useEffect } from 'react';
import { AdminHeader, type AdminView } from './AdminHeader';
import { AdminContentList } from './AdminContentList';
import { AdminNewContent } from './AdminNewContent';
import { AdminLanguages } from './AdminLanguages';
import { CHANNELS } from '../../data/channels';
import { INITIAL_LANGS, LANG_STORAGE_KEY, SELECTED_LANG_KEY, mergeWithInitialLangs, type LanguageItem } from '../../constants/languages';
import type { ChannelItem } from '../../types/content';

export const AdminPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('content');
  const [languages] = useState<LanguageItem[]>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return mergeWithInitialLangs(parsed);
      }
    } catch {
      // ignore
    }
    return INITIAL_LANGS;
  });

  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SELECTED_LANG_KEY);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return 'english';
  });

  const [channels, setChannels] = useState<ChannelItem[]>(CHANNELS);
  const [activeCategory, setActiveCategory] = useState<ChannelItem['category']>('youtube');
  const [initialEditId, setInitialEditId] = useState<string | null>(null);

  const refreshChannelsFromServer = () => {
    fetch('/api/get-channels', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setChannels(data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshChannelsFromServer();
  }, []);

  const mapCatToFormat = (cat: string) =>
    cat === 'professores' ? 'Professores' :
    cat === 'podcasts' ? 'Podcasts' :
    cat === 'series' ? 'Séries' :
    cat === 'movies' ? 'Filmes' :
    cat === 'sites' ? 'Recursos' : 'YouTube';

  const handleSave = async (item: ChannelItem) => {
    const prevItem = channels.find((c) => c.id === item.id);
    const exists = Boolean(prevItem);
    if (exists) {
      setChannels(channels.map((c) => (c.id === item.id ? item : c)));
    } else {
      setChannels([item, ...channels]);
    }

    if (item.language) {
      setSelectedLanguage(item.language);
      try {
        localStorage.setItem(SELECTED_LANG_KEY, item.language);
      } catch {
        // ignore
      }
    }
    if (item.category) {
      setActiveCategory(item.category);
    }

    try {
      const format = mapCatToFormat(item.category);
      await fetch('/api/save-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          item: {
            id: item.id,
            name: item.title,
            url: item.url,
            avatar: item.avatar,
            desc: item.description,
            tags: item.topics,
            beginnerFriendly: item.beginnerFriendly,
            subtitlesAvailable: item.subtitlesAvailable,
            transcriptUrl: item.transcriptUrl,
            avgDuration: item.avgDuration,
            platform: item.platform,
            originalLanguage: item.originalLanguage,
            originalLanguageLabel: item.originalLanguageLabel
          },
          isUpdate: exists,
          langKey: item.language || selectedLanguage,
          originalLangKey: prevItem ? (prevItem.language || selectedLanguage) : undefined,
          originalFormat: prevItem ? mapCatToFormat(prevItem.category) : undefined
        })
      });
      refreshChannelsFromServer();
    } catch {
      // ignore
    }

    setCurrentView('content');
  };

  const handleDelete = async (id: string) => {
    const itemToDelete = channels.find((c) => c.id === id);
    setChannels(channels.filter((c) => c.id !== id));

    if (itemToDelete) {
      try {
        const format = mapCatToFormat(itemToDelete.category);
        await fetch('/api/delete-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            format,
            langKey: itemToDelete.language || selectedLanguage
          })
        });
        refreshChannelsFromServer();
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5]">
      <AdminHeader
        currentView={currentView}
        onViewChange={(v) => setCurrentView(v)}
        selectedLanguage={selectedLanguage}
        languages={languages}
        onLanguageChange={setSelectedLanguage}
      />

      <main>
        {currentView === 'content' && (
          <AdminContentList
            channels={channels}
            selectedLanguage={selectedLanguage}
            activeTab={activeCategory}
            onTabChange={setActiveCategory}
            initialEditChannel={initialEditId ? channels.find((c) => c.id === initialEditId) ?? null : null}
            onClearInitialEdit={() => setInitialEditId(null)}
            onSaveChannel={handleSave}
            onDeleteChannel={handleDelete}
          />
        )}

        {currentView === 'new' && (
          <AdminNewContent
            onSave={handleSave}
            onCancel={() => setCurrentView('content')}
            existingChannels={channels}
            defaultLanguage={selectedLanguage}
            onEditExisting={(channelId) => {
              const target = channels.find((c) => c.id === channelId);
              if (target) {
                if (target.language) setSelectedLanguage(target.language);
                if (target.category) setActiveCategory(target.category);
              }
              setInitialEditId(channelId);
              setCurrentView('content');
            }}
          />
        )}

        {currentView === 'languages' && <AdminLanguages />}
      </main>
    </div>
  );
};
