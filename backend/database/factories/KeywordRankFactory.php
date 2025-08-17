<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\KeywordRank>
 */
class KeywordRankFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'keyword_id' => 1, // overridden in seeder
            'position' => $this->faker->numberBetween(1, 100),
            'url' => null,// overridden in seeder
            'raw' => json_encode(['example' => 'rank data'], JSON_THROW_ON_ERROR),
            'tracked_at' => null,// overridden in seeder
        ];
    }
}
