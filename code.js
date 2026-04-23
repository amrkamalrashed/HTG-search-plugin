figma.showUI(__html__, { width: 300, height: 260 });

// Our Mocked Internal API Data for Room Cards
const roomData = {
  bedroom: {
    title: "Bedroom No. 1",
    details: "1 King size bed",
    sleeps: "Sleeps 2"
  },
  complex: {
    title: "Shared Bedroom",
    details: "1 Large double bed\n1 Twin bed\n1 Bunk bed",
    sleeps: "Sleeps 5"
  },
  bathroom: {
    title: "4 Bathrooms",
    details: "Bidet, Shower, Toilet\nHot/cold water",
    sleeps: "" // Bathrooms don't have a 'sleeps' metric!
  },
  long: {
    title: "Hauptschlafzimmer (Master)",
    details: "1 Extra-large California King size bed with premium orthopedic mattress",
    sleeps: "Sleeps 2 adults + 1 infant"
  }
};

figma.ui.onmessage = async msg => {
  if (msg.type === 'populate') {
    const selection = figma.currentPage.selection;

    // Make sure they selected a Frame, Component, or Group (not just a single text layer)
    if (selection.length === 0 || selection[0].type === 'TEXT') {
      figma.notify("⚠️ Please select the whole Room Card (Frame/Group), not just text.");
      return;
    }

    const cardNode = selection[0];
    const data = roomData[msg.case];

    // Helper function to find a layer by name, load its font, and change its text
    async function updateTextLayer(layerName, newText) {
      const textNode = cardNode.findOne(node => node.name === layerName && node.type === 'TEXT');
      if (textNode) {
        await figma.loadFontAsync(textNode.fontName);
        textNode.characters = newText;
      }
    }

    // Run the updates mapped to the layer names
    await updateTextLayer('#title', data.title);
    await updateTextLayer('#details', data.details);
    await updateTextLayer('#sleeps', data.sleeps);

    figma.notify(`✅ Applied ${msg.case} data!`);
  }
};