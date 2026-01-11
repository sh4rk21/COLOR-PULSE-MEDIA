import * as React from 'react';

interface ContactTemplateProps {
  name: string;
  email: string;
  company?: string;
  project: string;
  budget?: string;
  timeline?: string;
}

export const ContactTemplate: React.FC<Readonly<ContactTemplateProps>> = ({
  name,
  email,
  company,
  project,
  budget,
  timeline,
}) => (
  <div style={{ fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333' }}>
    <h2 style={{ color: '#007aff' }}>Nouveau message de contact (Site Web)</h2>
    
    <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
      <p><strong>Nom :</strong> {name}</p>
      <p><strong>Email :</strong> <a href={`mailto:${email}`}>{email}</a></p>
      {company && <p><strong>Entreprise :</strong> {company}</p>}
      
      <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />
      
      <p><strong>Description du projet :</strong></p>
      <p style={{ whiteSpace: 'pre-wrap', backgroundColor: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #eee' }}>
        {project}
      </p>
      
      <div style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
        <p><strong>Budget estimé :</strong> {budget || 'Non spécifié'}</p>
        <p><strong>Échéance :</strong> {timeline || 'Non spécifiée'}</p>
      </div>
    </div>
  </div>
);
