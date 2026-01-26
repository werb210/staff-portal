let subscription: PushSubscription | null = null;

export const setPushSubscription = (next: PushSubscription | null) => {
  subscription = next;
};

export const getPushSubscription = () => subscription;
