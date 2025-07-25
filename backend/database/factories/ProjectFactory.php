<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $users = User::all();

        return [
            'name' => $this->faker->company(),
            'user_id' => $users->random()->id,
            'url'=> $this->faker->url(),
            'country'=> 'CA',
            'location_code'=> 1001801,
            'location_name'=> 'Calgary',
        ];
    }
}
