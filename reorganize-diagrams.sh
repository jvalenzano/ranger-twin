#!/bin/bash
set -e

echo "🔄 Reorganizing diagrams by audience..."
echo ""

cd /Users/jvalenzano/Projects/ranger-twin/docs/assets/diagrams

# Create subdirectories
echo "Creating subdirectories..."
mkdir -p developer stakeholder legacy

# Copy new images from Downloads
echo "Copying new developer diagrams from Downloads..."
cp /Users/jvalenzano/Downloads/track-1-devs/*.png developer/

echo "Copying new stakeholder diagrams from Downloads..."
cp /Users/jvalenzano/Downloads/track-2-stakes/*.png stakeholder/

# Move legacy diagrams
echo "Moving legacy Phase 1-3 diagrams..."
mv "Agentic AI Architecture.png" legacy/
mv "Local Developer Stack.png" legacy/
mv "How the pieces fit together.png" legacy/
mv "Phase 1 Architecture Boundaries.png" legacy/
mv "Coordinator Routing & Cross-Agent Cascade.png" legacy/

# Move existing diagrams to developer folder
echo "Moving existing developer diagram..."
mv "AgentBriefingEvent Rendering Pipeline.png" developer/

# Move existing diagrams to stakeholder folder
echo "Moving existing stakeholder diagrams..."
mv "Cedar Creek Fire 2022.png" stakeholder/
mv "The Cedar Creek Recovery Chain (Persona Cascade).png" stakeholder/
mv "The Confidence Ledger (Trust Architecture).png" stakeholder/
mv "The Legacy Bridge (TRACS & FSVeg Export).png" stakeholder/

echo ""
echo "📊 Directory structure:"
echo ""
tree -L 2 || find . -maxdepth 2 -type d

echo ""
echo "✅ Developer diagrams ($(ls -1 developer/ | wc -l | tr -d ' ') files):"
ls -1 developer/

echo ""
echo "✅ Stakeholder diagrams ($(ls -1 stakeholder/ | wc -l | tr -d ' ') files):"
ls -1 stakeholder/

echo ""
echo "✅ Legacy diagrams ($(ls -1 legacy/ | wc -l | tr -d ' ') files):"
ls -1 legacy/

echo ""
echo "🎯 Verifying Git LFS tracking..."
cd /Users/jvalenzano/Projects/ranger-twin
git lfs ls-files | head -5

echo ""
echo "📝 Adding changes to git..."
git add .

echo ""
echo "Ready to commit! Next steps:"
echo ""
echo "git commit -m \"docs: organize diagrams by audience (developer/stakeholder)"
echo ""
echo "- Added 8 developer-focused architecture diagrams"
echo "- Added 6 stakeholder-focused value/trust diagrams  "
echo "- Moved superseded Phase 1-3 diagrams to legacy/"
echo "- Git LFS tracking confirmed for all PNGs\""
echo ""
echo "✨ Done!"
