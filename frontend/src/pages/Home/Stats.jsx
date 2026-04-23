import React from 'react';

import { STATS } from '../../constants/content';
import { TEAL } from '../../constants/colors';

export default function Stats() {
  return (
    <section style={{ padding: "1rem 2rem 3rem" }}>
      <div style={{
        maxWidth: 900, margin: "0 auto",
        background: "#fff", borderRadius: 24,
        boxShadow: "0 4px 30px rgba(0,0,0,0.06)",
        display: "flex", flexWrap: "wrap", justifyContent: "space-around",
        border: `1px solid ${TEAL}1A`,
      }}>
        
      </div>
    </section>
  );
}
