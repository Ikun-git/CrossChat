const figlet = require('figlet');
const chalk = require('chalk');

// Define your colors
const discordhex = chalk.hex('#06c755'); // Green color
const linehex = chalk.hex('#7289da');    // Discord blue color

// First approach: Create separate figlet texts and place them intelligently
figlet.text('Cross Chat', {
  font: 'Standard',
  horizontalLayout: 'default',
  verticalLayout: 'default'
}, function(err, data) {
  if (err) {
    console.log('Something went wrong...');
    console.dir(err);
    return;
  }
  
  // Find where to split "Cross" and "Chat"
  const lines = data.split('\n');
  const splitPosition = 25; // Adjust this based on your font
  
  // Apply different colors to each part
  const coloredText = lines.map(line => {
    const firstPart = line.substring(0, splitPosition);
    const secondPart = line.substring(splitPosition);
    return discordhex(firstPart) + linehex(secondPart);
  }).join('\n');
  
});
