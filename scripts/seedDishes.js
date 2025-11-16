import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Dish from '../models/Dish.js';
import Canteen from '../models/Canteen.js';

dotenv.config();

const seedDishes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Get existing canteens
    const canteens = await Canteen.find();
    if (canteens.length === 0) {
      console.log('No canteens found. Please run seedCanteens.js first');
      process.exit(1);
    }

    // Clear existing dishes
    await Dish.deleteMany({});
    console.log('Cleared existing dishes');

    const dishes = [
      // Central Cafeteria dishes
      {
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice cooked with tender chicken pieces and traditional spices',
        canteen: canteens[0]._id,
        category: 'lunch',
        price: 96, // Discounted from 120
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500',
        ingredients: ['Basmati Rice', 'Chicken', 'Spices', 'Yogurt', 'Onions'],
        allergens: ['Dairy'],
        isVegetarian: false,
        isVegan: false,
        isSpicy: true,
        availability: true,
        tags: ['Popular', 'Spicy'],
        ratings: {
          averageRating: 4.5,
          totalReviews: 127
        },
        popularity: {
          orderCount: 450,
          score: 85
        },
        offer: {
          isActive: true,
          type: 'discount',
          title: '20% OFF on Biryani!',
          description: 'Limited time offer on our signature Chicken Biryani',
          discountPercentage: 20,
          originalPrice: 120,
          validUntil: new Date('2024-12-31')
        }
      },
      {
        name: 'Paneer Tikka Masala',
        description: 'Grilled cottage cheese cubes in rich creamy tomato gravy',
        canteen: canteens[0]._id,
        category: 'lunch',
        price: 100,
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500',
        ingredients: ['Paneer', 'Tomato', 'Cream', 'Spices'],
        allergens: ['Dairy'],
        isVegetarian: true,
        isVegan: false,
        isSpicy: false,
        availability: true,
        tags: ['Vegetarian', 'Popular'],
        ratings: {
          averageRating: 4.2,
          totalReviews: 89
        },
        popularity: {
          orderCount: 320,
          score: 78
        }
      },
      {
        name: 'Masala Dosa',
        description: 'Crispy rice crepe filled with spiced potato filling, served with sambhar and chutney',
        canteen: canteens[0]._id,
        category: 'breakfast',
        price: 60,
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500',
        ingredients: ['Rice', 'Lentils', 'Potato', 'Spices'],
        allergens: [],
        isVegetarian: true,
        isVegan: true,
        isSpicy: false,
        availability: true,
        tags: ['South Indian', 'Breakfast'],
        ratings: {
          averageRating: 4.7,
          totalReviews: 203
        },
        popularity: {
          orderCount: 580,
          score: 92
        }
      },
      {
        name: 'Veg Burger',
        description: 'Crispy vegetable patty with fresh vegetables in a soft bun',
        canteen: canteens[0]._id,
        category: 'snacks',
        price: 50,
        image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500',
        ingredients: ['Bun', 'Veg Patty', 'Lettuce', 'Tomato', 'Cheese'],
        allergens: ['Gluten', 'Dairy'],
        isVegetarian: true,
        isVegan: false,
        isSpicy: false,
        availability: true,
        tags: ['Fast Food', 'Snack'],
        ratings: {
          averageRating: 3.8,
          totalReviews: 56
        },
        popularity: {
          orderCount: 180,
          score: 65
        }
      },
      {
        name: 'Samosa (2 pcs)',
        description: 'Crispy fried pastry filled with spiced potatoes and peas',
        canteen: canteens[0]._id,
        category: 'snacks',
        price: 30,
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500',
        ingredients: ['Flour', 'Potato', 'Peas', 'Spices'],
        allergens: ['Gluten'],
        isVegetarian: true,
        isVegan: true,
        isSpicy: true,
        availability: true,
        tags: ['Snack', 'Popular'],
        ratings: {
          averageRating: 4.3,
          totalReviews: 142
        },
        popularity: {
          orderCount: 420,
          score: 81
        },
        offer: {
          isActive: true,
          type: 'buy_one_get_one',
          title: 'BOGO on Samosas!',
          description: 'Buy one plate of samosas, get one free',
          validUntil: new Date('2024-12-15')
        }
      },
      {
        name: 'Mango Lassi',
        description: 'Refreshing yogurt drink blended with sweet mango pulp',
        canteen: canteens[0]._id,
        category: 'beverages',
        price: 40,
        image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=500',
        ingredients: ['Yogurt', 'Mango', 'Sugar'],
        allergens: ['Dairy'],
        isVegetarian: true,
        isVegan: false,
        isSpicy: false,
        availability: true,
        tags: ['Beverage', 'Cold'],
        ratings: {
          averageRating: 4.6,
          totalReviews: 98
        },
        popularity: {
          orderCount: 290,
          score: 76
        }
      },
    ];

    // Engineering Block Cafe dishes
    if (canteens.length > 1) {
      dishes.push(
        {
          name: 'Cheese Sandwich',
          description: 'Grilled sandwich with melted cheese and vegetables',
          canteen: canteens[1]._id,
          category: 'snacks',
          price: 45,
          image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500',
          ingredients: ['Bread', 'Cheese', 'Butter', 'Vegetables'],
          allergens: ['Gluten', 'Dairy'],
          isVegetarian: true,
          isVegan: false,
          isSpicy: false,
          availability: true,
          tags: ['Fast Food', 'Snack'],
          ratings: {
            averageRating: 4.0,
            totalReviews: 73
          },
          popularity: {
            orderCount: 210,
            score: 70
          }
        },
        {
          name: 'Cold Coffee',
          description: 'Chilled coffee with milk and ice cream',
          canteen: canteens[1]._id,
          category: 'beverages',
          price: 40, // Combo price
          image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500',
          ingredients: ['Coffee', 'Milk', 'Ice Cream', 'Sugar'],
          allergens: ['Dairy'],
          isVegetarian: true,
          isVegan: false,
          isSpicy: false,
          availability: true,
          tags: ['Beverage', 'Cold'],
          ratings: {
            averageRating: 4.4,
            totalReviews: 156
          },
          popularity: {
            orderCount: 380,
            score: 82
          },
          offer: {
            isActive: true,
            type: 'combo',
            title: 'Coffee + Fries Combo',
            description: 'Get Cold Coffee and French Fries together at special price',
            validUntil: new Date('2024-12-20')
          }
        },
        {
          name: 'Veg Fried Rice',
          description: 'Stir-fried rice with mixed vegetables and soy sauce',
          canteen: canteens[1]._id,
          category: 'lunch',
          price: 80,
          image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500',
          ingredients: ['Rice', 'Vegetables', 'Soy Sauce', 'Spices'],
          allergens: ['Soy'],
          isVegetarian: true,
          isVegan: true,
          isSpicy: false,
          availability: true,
          tags: ['Chinese', 'Popular'],
          ratings: {
            averageRating: 4.1,
            totalReviews: 94
          },
          popularity: {
            orderCount: 275,
            score: 74
          }
        },
        {
          name: 'Pasta Alfredo',
          description: 'Creamy white sauce pasta with herbs',
          canteen: canteens[1]._id,
          category: 'lunch',
          price: 88, // Discounted from 110
          image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500',
          ingredients: ['Pasta', 'Cream', 'Cheese', 'Herbs'],
          allergens: ['Gluten', 'Dairy'],
          isVegetarian: true,
          isVegan: false,
          isSpicy: false,
          availability: true,
          tags: ['Italian', 'Continental'],
          ratings: {
            averageRating: 3.9,
            totalReviews: 67
          },
          popularity: {
            orderCount: 195,
            score: 68
          },
          offer: {
            isActive: true,
            type: 'discount',
            title: 'Pasta Special - 20% OFF',
            description: 'Enjoy our delicious Pasta Alfredo at 20% discount',
            discountPercentage: 20,
            originalPrice: 110,
            validUntil: new Date('2024-12-25')
          }
        },
        {
          name: 'French Fries',
          description: 'Crispy golden fried potato fingers',
          canteen: canteens[1]._id,
          category: 'snacks',
          price: 40,
          image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500',
          ingredients: ['Potato', 'Salt'],
          allergens: [],
          isVegetarian: true,
          isVegan: true,
          isSpicy: false,
          availability: true,
          tags: ['Fast Food', 'Snack'],
          ratings: {
            averageRating: 4.5,
            totalReviews: 189
          },
          popularity: {
            orderCount: 520,
            score: 88
          }
        }
      );
    }

    const createdDishes = await Dish.insertMany(dishes);
    console.log(`✅ Successfully seeded ${createdDishes.length} dishes`);

    // Display summary
    console.log('\n📊 Dishes by Canteen:');
    for (const canteen of canteens) {
      const count = createdDishes.filter(
        d => d.canteen.toString() === canteen._id.toString()
      ).length;
      console.log(`  - ${canteen.name}: ${count} dishes`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding dishes:', error);
    process.exit(1);
  }
};

seedDishes();
