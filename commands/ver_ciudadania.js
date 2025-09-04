const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Ciudadania = require("../models/Ciudadania");

module.exports = {
  data: new SlashCommandBuilder()
  .setName("ver-ciudadania")
  .setDescription("Ve la ciudadania de un usuario ya registrada")
  .addUserOption(option =>
    option.setName("usuario")
    .setDescription("Coloca el usuario que quieres ver la ciudadania de tal jugador")
    .setRequired(false)
  ),

  async execute(interaction) {
    // Si se especifica usuario, muestra su ciudadania, si no, muestra la del usuario que ejecuta el comando
    const usuario = interaction.options.getUser("usuario") || interaction.user;
    const ciudadania = await Ciudadania.findOne({ usuarioDiscord: usuario.id});

    if (!ciudadania) {
      return interaction.reply({ content: `❌ ${usuario} nooo tiene ciudadania registrada bb.`, ephemeral: true });
    }

        let expiraField = { name: "Expira", value: "No disponible", inline: true };
    if (
      ciudadania.fechaExpiracion &&
      ciudadania.fechaExpiracion instanceof Date &&
      !isNaN(ciudadania.fechaExpiracion)
    ) {
      expiraField.value = `<t:${Math.floor(ciudadania.fechaExpiracion.getTime() / 1000)}:D>`;
    }

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("📜 Ciudadanía")
      .setThumbnail(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${ciudadania.usuarioRoblox}&size=150x150&format=Png&isCircular=false`)
      .addFields(
        { name: "Nombre", value: ciudadania.nombre, inline: true },
        { name: "Apellido", value: ciudadania.apellido, inline: true },
        { name: "Nacionalidad", value: ciudadania.nacionalidad, inline: true },
        { name: "Sexo", value: ciudadania.sexo, inline: true },
        { name: "Grupo Sanguíneo", value: ciudadania.grupoSanguineo, inline: true },
        { name: "Fecha de Nacimiento", value: ciudadania.fechaNacimiento, inline: true },
        { name: "Usuario Roblox", value: ciudadania.usuarioRoblox, inline: true },
        expiraField
      );

    if (ciudadania.run) embed.addFields({ name: "RUN", value: ciudadania.run, inline: true });

    await interaction.reply({ embeds: [embed] });
  },
};