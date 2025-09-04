const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const mongoose = require("mongoose");
const { token, mongoUri } = require("./config.json");
const presenceArray = require('./presence');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.GuildMember]
});

client.on('ready', () => {
  let i = 0;
  setInterval(() => {
    client.user.setActivity(presenceArray[i], {});
    i = (i + 1) % presenceArray.length;
  }, 10000); // Cambia cada 10 segundos
});
// ...existing code...
client.commands = new Collection();

// Cargar comandos de /commands
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const cmd = require(path.join(commandsPath, file));
  if (cmd?.data && cmd?.execute) {
    client.commands.set(cmd.data.name, cmd);
  } else {
    console.warn(`⚠️  El comando ${file} no exporta "data" o "execute".`);
  }
}

// Conexión a MongoDB
(async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("✅ Conectado a MongoDB");
  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err?.message || err);
  }
})();

// Eventos del bot
client.once("ready", () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`❌ Error ejecutando /${interaction.commandName}:`, error);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content: "❌ Hubo un error al ejecutar el comando.", ephemeral: true });
    } else {
      await interaction.reply({ content: "❌ Hubo un error al ejecutar el comando.", ephemeral: true });
    }
  }
});

client.login(token);