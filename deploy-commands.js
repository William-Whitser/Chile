const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { clientId, guildId, token } = require("./config.json");

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const cmd = require(path.join(commandsPath, file));
  if (cmd?.data && cmd?.execute) {
    commands.push(cmd.data.toJSON());
  } else {
    console.warn(`⚠️  Saltando ${file}: no exporta "data" o "execute".`);
  }
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log(`🔄 Registrando ${commands.length} comandos (scope guild: ${guildId})...`);
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log("✅ Comandos registrados correctamente.");
  } catch (error) {
    console.error("❌ Error al registrar comandos:", error);
  }
})();