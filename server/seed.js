require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Party = require('./models/Party');
const Commodity = require('./models/Commodity');
const PaymentTerm = require('./models/PaymentTerm');
const BankDetails = require('./models/BankDetails');

async function seedDatabase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Party.deleteMany({}),
      Commodity.deleteMany({}),
      PaymentTerm.deleteMany({}),
      BankDetails.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Seed Buyers (based on contract example)
    const buyers = await Party.create([
      {
        companyName: 'FORMOSA SHYEN HORNG METAL SDN.BHD',
        address: 'LOT 2-33, JALAN PERINDUSTRIAN MAHKOTA 2, TAMAN PERINDUSTRIAN MAHKOTA 43700 BERANANG, SELANGOR D.E., MALAYSIA',
        contactPerson: 'Mr. Wong',
        email: 'procurement@formosa-shyen-horng.com.my',
        phone: '+60-3-8724-5566',
        type: 'BUYER'
      },
      {
        companyName: 'MALAYSIA STEEL WORKS SDN.BHD',
        address: 'NO. 45, JALAN INDUSTRI 15, TAMAN INDUSTRI, 81100 JOHOR BAHRU, JOHOR, MALAYSIA',
        contactPerson: 'Ms. Lee Mei Ling',
        email: 'purchasing@malaysiasteel.com',
        phone: '+60-7-3551-8899',
        type: 'BUYER'
      },
      {
        companyName: 'SINGAPORE METALS TRADING PTE LTD',
        address: '123 TANJONG PAGAR ROAD, #05-01, SINGAPORE 088538',
        contactPerson: 'Mr. Tan Wei Jie',
        email: 'contracts@sgmetals.com.sg',
        phone: '+65-6224-7788',
        type: 'BUYER'
      }
    ]);
    console.log(`Created ${buyers.length} buyers`);

    // Seed Sellers (based on contract example)
    const sellers = await Party.create([
      {
        companyName: 'HOMI METAL CO., LTD',
        address: 'NO. 236, XINJIN RD., XINYING DIST., TAINAN CITY 730, TAIWAN (R.O.C)',
        contactPerson: 'Mr. Chen',
        email: 'export@homimetal.com.tw',
        phone: '+886-6-633-5566',
        type: 'SELLER'
      },
      {
        companyName: 'TAIWAN STEEL CORPORATION',
        address: 'NO. 189, ZHONGZHENG RD., KAOHSIUNG CITY 800, TAIWAN',
        contactPerson: 'Ms. Wang',
        email: 'sales@taiwansteel.com',
        phone: '+886-7-551-2233',
        type: 'SELLER'
      }
    ]);
    console.log(`Created ${sellers.length} sellers`);

    // Seed Commodities (based on contract example)
    const commodities = await Commodity.create([
      {
        name: 'Extrusion 1% attachment',
        description: 'Aluminum extrusion scrap with 1% attachment, in 20-40 feet containers',
        hsCode: '7602.00.00',
        defaultUnit: 'MT',
        defaultOrigin: 'Taiwan',
        defaultPacking: 'In 20-40 feet Containers'
      },
      {
        name: 'Aluminum Scrap 6063',
        description: 'Aluminum scrap alloy 6063, clean and dry',
        hsCode: '7602.00.00',
        defaultUnit: 'MT',
        defaultOrigin: 'Taiwan',
        defaultPacking: 'In containers or loose'
      },
      {
        name: 'Copper Scrap Millberry',
        description: 'Copper wire scrap, 99.9% purity',
        hsCode: '7404.00.00',
        defaultUnit: 'MT',
        defaultOrigin: 'USA',
        defaultPacking: 'In bales or containers'
      },
      {
        name: 'Stainless Steel Scrap 304',
        description: 'Stainless steel scrap grade 304',
        hsCode: '7204.21.00',
        defaultUnit: 'MT',
        defaultOrigin: 'Japan',
        defaultPacking: 'In bundles or containers'
      },
      {
        name: 'Zinc Scrap',
        description: 'Zinc scrap, mixed grades',
        hsCode: '7902.00.00',
        defaultUnit: 'MT',
        defaultOrigin: 'China',
        defaultPacking: 'In bulk or containers'
      }
    ]);
    console.log(`Created ${commodities.length} commodities`);

    // Seed Payment Terms (based on contract example and standard practices)
    const paymentTerms = await PaymentTerm.create([
      {
        name: '10% Deposit + Balance TT',
        description: 'Buyer will arrange 10% deposit TT and balance TT against copy docs within 5 days to the Seller\'s account',
        terms: 'T/T 10% deposit + balance against copy docs within 5 days',
        daysFromBL: 5
      },
      {
        name: '100% TT in Advance',
        description: '100% payment by Telegraphic Transfer before shipment',
        terms: '100% T/T before shipment',
        daysFromBL: 0
      },
      {
        name: '30% Deposit + 70% at sight',
        description: '30% deposit TT, 70% by L/C at sight',
        terms: '30% T/T deposit + 70% L/C at sight',
        daysFromBL: 0
      },
      {
        name: 'CAD (Cash Against Documents)',
        description: 'Payment against presentation of shipping documents',
        terms: 'CAD - Cash against documents',
        daysFromBL: 3
      },
      {
        name: 'Net 30 days',
        description: 'Payment due 30 days from Bill of Lading date',
        terms: 'Net 30 days from B/L date',
        daysFromBL: 30
      },
      {
        name: 'L/C 90 days',
        description: 'Letter of Credit payable 90 days after B/L date',
        terms: 'L/C 90 days from B/L date',
        daysFromBL: 90
      }
    ]);
    console.log(`Created ${paymentTerms.length} payment terms`);

    // Seed Bank Details (based on contract example)
    const bankDetailsRecords = await BankDetails.create([
      {
        bankName: 'TAIPEI FUBON COMMERCIAL BANK, HSINYING BRANCH',
        accountName: 'HOMI METAL CO., LTD',
        accountNumber: 'NO. 566-7596-8123',
        swiftCode: 'TPBKTWTP',
        bankAddress: '1F., NO 150, FUXING RD., XINYING DIST., TAINAN CITY',
        currency: 'USD',
        isDefault: true
      },
      {
        bankName: 'CATHAY UNITED BANK',
        accountName: 'HOMI METAL CO., LTD',
        accountNumber: '123-456-789012',
        swiftCode: 'ESBKTWTP',
        bankAddress: 'NO. 99, ZHONGSHAN RD., TAIPEI CITY, TAIWAN',
        currency: 'USD',
        isDefault: false
      }
    ]);
    console.log(`Created ${bankDetailsRecords.length} bank details`);

    console.log('\n=== Database seeded successfully! ===');
    console.log(`Total: ${buyers.length} buyers, ${sellers.length} sellers, ${commodities.length} commodities`);
    console.log(`       ${paymentTerms.length} payment terms, ${bankDetailsRecords.length} bank details`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
