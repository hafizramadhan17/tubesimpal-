require("dotenv/config");

const bcrypt = require("bcrypt");

async function seedBuyer() {
  const email = process.env.SEED_BUYER_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_BUYER_PASSWORD;

  if (!email || !/^[^@\s]+@greenmarket\.com$/.test(email)) {
    throw new Error("Isi SEED_BUYER_EMAIL dengan alamat @greenmarket.com.");
  }
  if (!password || password.length < 8 || Buffer.byteLength(password) > 72) {
    throw new Error("SEED_BUYER_PASSWORD harus minimal 8 karakter dan maksimal 72 byte.");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("Isi DATABASE_URL dengan koneksi database yang akan diisi.");
  }

  const prisma = require("../lib/prisma");

  try {
    const result = await prisma.user.createMany({
      data: [
        {
          username: "demo_buyer",
          email,
          password: await bcrypt.hash(password, 10),
          role: "BUYER",
        },
      ],
      skipDuplicates: true,
    });

    console.log(
      result.count === 1
        ? "Akun demo buyer berhasil dibuat."
        : "Email sudah terdaftar. Data akun yang ada tetap dipakai.",
    );
  } finally {
    await prisma.$disconnect();
  }
}

seedBuyer().catch((error) => {
  console.error("Seeder gagal:", error.code || error.message);
  process.exitCode = 1;
});
