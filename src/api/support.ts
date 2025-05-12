import api from './axios';
import { SupportTicketDto } from '../types';

export const createSupportTicket = async (ticketData: SupportTicketDto): Promise<void> => {
  try {
    await api.post('/support/ticket', ticketData);
  } catch (error) {
    console.error('Support ticket creation error:', error);
    throw error;
  }
};