'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BookOpen, Target, UserCheck, Rocket } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: BookOpen,
      title: 'Welcome to Collegia!',
      description: 'Get ready to start your learning journey with our comprehensive courses.',
      content: 'We offer courses across multiple tiers to match your learning goals and experience level.'
    },
    {
      icon: Target,
      title: 'Set Your Learning Goals',
      description: 'What do you want to achieve with our platform?',
      content: 'Choose from basics, intermediate, or advanced courses based on your current skill level and objectives.'
    },
    {
      icon: UserCheck,
      title: 'Complete Your Profile',
      description: 'Help us personalize your learning experience.',
      content: 'Add your interests and preferences to get course recommendations tailored to you.'
    },
    {
      icon: Rocket,
      title: 'Ready to Learn!',
      description: 'You\'re all set to start your educational journey.',
      content: 'Explore our course catalog and begin your first lesson today!'
    }
  ];

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mb-4">
            <IconComponent className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{currentStepData.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            {currentStepData.content}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-100 dark:bg-gray-800'
                }`}
              />
            ))}
          </div>

          <div className="flex space-x-2">
            {currentStep < steps.length - 1 && (
              <Button variant="outline" onClick={handleSkip} className="flex-1">
                Skip
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};