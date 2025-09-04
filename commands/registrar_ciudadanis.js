const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Ciudadania = require("../models/Ciudadania");

const ROL_ID = "1409062959438762076";

function generarRun() {
  const numero = Math.floor(1000000 + Math.random() * 9000000);
  const dv = Math.floor(Math.random() * 10);
  return `${numero}-${dv}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("registrar-ciudadania")
    .setDescription("Registra la ciudadanía de un usuario")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("El usuario al que registrarás la ciudadanía")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("nombre")
        .setDescription("Nombre")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("apellido")
        .setDescription("Apellido")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("nacionalidad")
        .setDescription("Nacionalidad")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("sexo")
        .setDescription("Sexo (Hombre o Mujer)")
        .setRequired(true)
        .addChoices(
          { name: "Hombre", value: "Hombre" },
          { name: "Mujer", value: "Mujer" }
        )
    )
    .addStringOption(option =>
      option.setName("fecha-nacimiento")
        .setDescription("Fecha de nacimiento (dd/mm/aaaa)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("grupo-sanguineo")
        .setDescription("Grupo sanguíneo")
        .setRequired(true)
        .addChoices(
          { name: "O+", value: "O+" },
          { name: "O-", value: "O-" },
          { name: "A+", value: "A+" },
          { name: "A-", value: "A-" },
          { name: "B+", value: "B+" },
          { name: "B-", value: "B-" },
          { name: "AB+", value: "AB+" },
          { name: "AB-", value: "AB-" }
        )
    )
    .addStringOption(option =>
      option.setName("usuario-roblox")
        .setDescription("Usuario de Roblox")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const usuario = interaction.options.getUser("usuario");
      const nombre = interaction.options.getString("nombre");
      const apellido = interaction.options.getString("apellido");
      const nacionalidad = interaction.options.getString("nacionalidad");
      const sexo = interaction.options.getString("sexo");
      const fechaNacimiento = interaction.options.getString("fecha-nacimiento");
      const grupoSanguineo = interaction.options.getString("grupo-sanguineo");
      const usuarioRoblox = interaction.options.getString("usuario-roblox");

      // Solo permitir un registro por usuario
      const yaRegistrado = await Ciudadania.findOne({ usuarioDiscord: usuario.id });
      if (yaRegistrado) {
        return interaction.reply({
          content: "❌ Este usuario ya tiene una ciudadanía registrada.",
          ephemeral: true
        });
      }

      // Generar RUN y avatarRoblox automáticamente
      const run = generarRun();
      const avatarRoblox = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${usuarioRoblox}&size=150x150&format=Png&isCircular=false`;

      // Guardar en la base de datos
      const nuevaCiudadania = new Ciudadania({
        usuarioDiscord: usuario.id,
        nombre,
        apellido,
        nacionalidad,
        sexo,
        fechaNacimiento,
        grupoSanguineo,
        usuarioRoblox,
        run,
        avatarRoblox,
        fechaExpedicion: new Date(),
        fechaExpiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });

      await nuevaCiudadania.save();

      // Asignar rol al usuario que ejecutó el comando
      const miembro = await interaction.guild.members.fetch(usuario.id);
      const rol = interaction.guild.roles.cache.get(ROL_ID);
      if (rol && miembro && !miembro.roles.cache.has(ROL_ID)) {
        await miembro.roles.add(rol);
      }

      // Embed de confirmación
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("📋 Ciudadanía Nacional")
        .setThumbnail(avatarRoblox)
        .addFields(
          { name: "👤 Usuario Discord", value: `${usuario}`, inline: true },
          { name: "🧾 Nombre IC", value: `${nombre} ${apellido}`, inline: true },
          { name: "🌎 Nacionalidad", value: nacionalidad, inline: true },
          { name: "⚧ Sexo", value: sexo, inline: true },
          { name: "🎂 Fecha Nacimiento", value: fechaNacimiento, inline: true },
          { name: "🩸 Grupo Sanguíneo", value: grupoSanguineo, inline: true },
          { name: "🎮 Usuario Roblox", value: usuarioRoblox, inline: true },
          { name: "RUN", value: run, inline: true }
        )
        .setFooter({ text: `Registrado por ${interaction.user.username}` })
        .setTimestamp();

      await interaction.reply({
        content: "✅ Ciudadanía registrada con éxito",
        embeds: [embed],
        ephemeral: true
      });

    } catch (error) {
      console.error("❌ Error registrando ciudadanía:", error);

      await interaction.reply({
        content: "❌ Hubo un error al registrar la ciudadanía.",
        ephemeral: true
      });
    }
  }
};