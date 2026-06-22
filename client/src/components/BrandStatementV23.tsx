/**
 * BrandStatementV23.tsx — Brand Statement Section
 * 
 * Displays the brand's main statement/tagline.
 */

import React from 'react';

interface BrandStatementProps {
  text?: string;
  subtext?: string;
}

export function BrandStatementV23({
  text = "Empower Your Style",
  subtext = "Découvrez les meilleures marques au meilleur prix",
}: BrandStatementProps) {
  return (
    <section className="brand-statement">
      <h2 className="statement-text">{text}</h2>
      {subtext && <p className="statement-sub">{subtext}</p>}
    </section>
  );
}

export default BrandStatementV23;
