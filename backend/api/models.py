# backend/api/models.py
from django.db import models

class Activity(models.Model):
    user = models.CharField(max_length=100)
    activity_type = models.CharField(max_length=100)
    data = models.JSONField()
    predicted_emission = models.FloatField(default=0)
    timestamp = models.DateTimeField(auto_now_add=True)
    transaction_hash = models.CharField(max_length=255, null=True, blank=True)
    token_id = models.IntegerField(null=True, blank=True)  # NFT Token ID from blockchain
    user_wallet = models.CharField(max_length=42, null=True, blank=True)  # Ethereum address

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'Activities'

    def __str__(self):
        return f"{self.user} - {self.activity_type} (Token #{self.token_id})"
