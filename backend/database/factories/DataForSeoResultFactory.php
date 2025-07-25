<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DataForSeoResult>
 */
class DataForSeoResultFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'data_for_seo_task_id' => 1, // overridden in seeder
            'type' => $this->faker->randomElement(['organic', 'paid']),
            'rank_group' => $this->faker->numberBetween(1, 100),
            'rank_absolute' => $this->faker->numberBetween(1, 100),
            'domain' => null,// overridden in seeder
            'title' => $this->faker->sentence(6),
            'description' => $this->faker->text(120),
            'url' => $this->faker->url(),
            'breadcrumb' => $this->faker->text(50),
        ];
    }
}
