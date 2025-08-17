<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DataForSeoTask>
 */
class DataForSeoTaskFactory extends Factory
{
    public function definition(): array
    {
        return [
            'keyword_id' => 1, // will be overridden in seeder
            'project_id' => 1, // will be overridden in seeder
            'task_id' => $this->faker->uuid(),
            'cost' => '0.0006',
            'status' => 'Completed',
            'submitted_at' => $this->faker->dateTimeThisYear(),
            'completed_at' => $this->faker->optional()->dateTimeThisYear(),
            'raw_response' => json_encode(['example' => 'response'], JSON_THROW_ON_ERROR),
        ];
    }
}
