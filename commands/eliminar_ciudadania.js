const { SlashCommandBuilder } = require("discord.js");
const Ciudadania = require("../models/Ciudadania");

const ROL_ID = "1409036114433675264";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("eliminar-ciudadania")
    .setDescription("Eliminar la ciudadanía registrada de un usuario")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("El usuario al que le eliminarás la ciudadanía")
        .setRequired(true)
    ),

  async execute(interaction) {
    // Solo permite si el usuario tiene el rol específico
    if (!interaction.member.roles.cache.has(ROL_ID)) {
      return interaction.reply({ content: "❌ No tienes permisos para usar este comando.", ephemeral: true });
    }

    const usuario = interaction.options.getUser("usuario");
    const ciudadania = await Ciudadania.findOne({ usuarioDiscord: usuario.id });

    if (!ciudadania) {
      return interaction.reply({ content: `❌ ${usuario} no tiene ciudadanía registrada.`, ephemeral: true });
    }

    await Ciudadania.deleteOne({ usuarioDiscord: usuario.id });

    await interaction.reply({ content: `✅ Ciudadanía de ${usuario} eliminada.`, ephemeral: true });
  },
};