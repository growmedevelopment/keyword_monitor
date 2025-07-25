<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Keyword>
 */
class KeywordFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => 1,
            'keyword' => $this->faker->unique()->words(2, true),
            'tracking_priority' => '1',
            'location' => 'Calgary',
            'language' => 'en',
            'is_active' => true,
            'last_submitted_at' => $this->faker->optional()->dateTimeThisYear(),
        ];
    }
}
