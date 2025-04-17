import React, { useState, useEffect } from 'react';
import {
  Button,
  Dropdown,
  Option,
  Title1,
  Title3,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import {
  Settings24Regular,
  PaintBrush24Regular,
  TextBulletListSquare24Regular,
  Chat24Regular,
  DocumentText24Regular,
  Delete24Regular,
  LockClosed24Regular,
  Cloud24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
    fontFamily: 'Segoe UI, sans-serif',
  },
  sidebar: {
    width: '260px',
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.padding('40px', '24px'),
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  sidebarTitle: {
    marginBottom: '64px',
    fontWeight: 700,
    fontSize: '20px',
  },
  sidebarItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 500,
    ...shorthands.transition('background-color', '150ms'),
    color: tokens.colorNeutralForeground1,
    marginBottom: '8px',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3Hover,
    },
  },
  activeItem: {
    backgroundColor: tokens.colorNeutralBackground3Selected, 
    fontWeight: '600',
    color: tokens.colorNeutralForeground1, 
    '& svg': {
      color: tokens.colorNeutralForeground1, 
    },
  },
  
  content: {
    flex: 1,
    padding: '64px 48px 96px 48px',
    paddingLeft: '90px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.padding('40px'),
    borderRadius: tokens.borderRadiusXLarge,
    boxShadow: tokens.shadow28,
    maxWidth: '960px',
    width: '100%',
    marginBottom: '48px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
    alignItems: 'start',
    width: '100%',
    marginBottom: '32px',
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '10px',
    fontWeight: 600,
    fontSize: '16px',
    color: tokens.colorNeutralForeground1,
  },
  dropdown: {
    width: '100%',
    height: '40px',
  },
  saveButton: {
    alignSelf: 'flex-end',
    fontWeight: 600,
    height: '40px',
    fontSize: '14px',
  },
  sidebarHeader: {
    marginBottom: '18px', 
  },
  
  sidebarMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  '& svg': {
  color: tokens.colorNeutralForegroundOnBrand,
  opacity: 0.9,
},

  
});

const Settings = () => {
  const styles = useStyles();

  const [activeSection, setActiveSection] = useState('general');
  const [preferences, setPreferences] = useState({
    language: 'es',
    theme: 'light',
    summaryFormat: 'short',
    summaryStyle: 'paragraph',
    summaryTone: 'neutral',
    examMultiple: 'inline',
    examOpen: 'inline',
    examDifficulty: 'intermediate',
    chatTone: 'neutral',
  });

  useEffect(() => {
    const stored = localStorage.getItem('userPreferences');
    if (stored) setPreferences(JSON.parse(stored));
  }, []);

  const handleChange = (name, value) => {
    setPreferences((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    alert('✅ Preferencias guardadas');
  };

  const menuItems = [
    { key: 'general', label: 'General', icon: <Settings24Regular /> },
    { key: 'appearance', label: 'Apariencia', icon: <PaintBrush24Regular /> },
    { key: 'summaries', label: 'Resúmenes', icon: <TextBulletListSquare24Regular /> },
    { key: 'exams', label: 'Exámenes', icon: <DocumentText24Regular /> },
    { key: 'chat', label: 'Chat', icon: <Chat24Regular /> },
    { key: 'security', label: 'Seguridad', icon: <LockClosed24Regular /> },
    { key: 'integrations', label: 'Integraciones', icon: <Cloud24Regular /> },
    { key: 'delete', label: 'Borrar Historial', icon: <Delete24Regular /> },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className={styles.card}>
  <div className={styles.formRow}>
    <div className={styles.formField}>
      <label className={styles.label}>Idioma</label>
      <Dropdown
        className={styles.dropdown}
        value={preferences.language}
        onOptionSelect={(_, data) => handleChange('language', data.optionValue)}
      >
        <Option value="es">Español</Option>
        <Option value="en">Inglés</Option>
      </Dropdown>
    </div>

    <div className={styles.formField}>
      <label className={styles.label}>Tema</label>
      <Dropdown
        className={styles.dropdown}
        value={preferences.theme}
        onOptionSelect={(_, data) => handleChange('theme', data.optionValue)}
      >
        <Option value="light">Claro</Option>
        <Option value="dark">Oscuro</Option>
      </Dropdown>
    </div>
  </div>

  { }
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
    <Button appearance="primary" onClick={handleSave}>
      Guardar Cambios
    </Button>
  </div>
</div>

        );

      default:
        return <div className={styles.card}><p>⚠️ Sección en construcción...</p></div>;
    }
  };

  return (
    <div className={styles.layout}>
     <aside className={styles.sidebar}>
  <div className={styles.sidebarHeader}>
    <Title3 className={styles.sidebarTitle}>⚙️ Configuración</Title3>
  </div>

  <nav className={styles.sidebarMenu}>
    {menuItems.map((item) => (
      <div
        key={item.key}
        className={`${styles.sidebarItem} ${activeSection === item.key ? styles.activeItem : ''}`}
        onClick={() => setActiveSection(item.key)}
      >
        {item.icon}
        {item.label}
      </div>
    ))}
  </nav>
</aside>


      <main className={styles.content}>
        <Title1 style={{ marginBottom: 32 }}>{menuItems.find((m) => m.key === activeSection)?.label}</Title1>
        {renderSection()}
      </main>
    </div>
  );
};

export default Settings;
