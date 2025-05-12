export interface User {
    id: string;
    name: string;
    email: string;
    status?: string;
    roles?: string[];
  }

  export interface Template {
    id: string;
    title: string;
    description: string;
    topic: string;
    imageUrl?: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt?: string;
    creator: User;
    likesCount: number;
    commentsCount: number;
    formsCount: number;
    tags: string[];
    allowedUsers: string[];
  }

  export enum QuestionType {
    SingleLineString = 0,
    MultiLineText = 1,
    Integer = 2,
    Checkbox = 3
  }
  
  export interface Question {
    id: string;
    title: string;
    description: string;
    orderIndex: number;
    showInResults: boolean;
    type: QuestionType;
  }
  
  export interface Answer {
    id: string;
    questionId: string;
    stringValue?: string;
    integerValue?: number;
    booleanValue?: boolean;
    question?: Question;
  }
  
  export interface Form {
    id: string;
    submittedAt: string;
    user: User;
    template: Template;
    answers: Answer[];
  }
  
  export interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: User;
  }
  
  export interface Tag {
    id: string;
    name: string;
    templatesCount: number;
  }
  
  export interface TagCloudItem {
    name: string;
    weight: number;
  }
  
  export interface FormResultsAggregation {
    templateId: string;
    templateTitle: string;
    totalResponses: number;
    questionResults: QuestionResult[];
  }
  
  export interface QuestionResult {
    questionId: string;
    questionTitle: string;
    type: QuestionType;
    averageValue?: number;
    minValue?: number;
    maxValue?: number;
    mostCommonValues?: StringValueCount[];
    trueCount?: number;
    falseCount?: number;
    truePercentage?: number;
  }
  
  export interface StringValueCount {
    value: string;
    count: number;
  }
  
  export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    accessToken?: string;
    refreshToken?: string;
    roles: string[];
  }

export interface UserForRegistrationDto {
    name: string;
    email: string;
    password: string;
  }
  
  export interface UserForAuthenticationDto {
    email: string;
    password: string;
  }
  
  export interface TemplateForCreationDto {
    title: string;
    description: string;
    topic: string;
    imageUrl?: string;
    isPublic: boolean;
    tags: string[];
    allowedUserEmails: string[];
  }
  
  export interface TemplateForUpdateDto {
    title: string;
    description: string;
    topic: string;
    imageUrl?: string;
    isPublic: boolean;
    tags: string[];
    allowedUserEmails: string[];
  }
  
  export interface QuestionForCreationDto {
    title: string;
    description: string;
    orderIndex: number;
    showInResults: boolean;
    type: QuestionType;
  }
  
  export interface QuestionForUpdateDto {
    title: string;
    description: string;
    showInResults: boolean;
  }
  
  export interface CommentForCreationDto {
    content: string;
  }
  
  export interface CommentForUpdateDto {
    content: string;
  }
  
  export interface AnswerForCreationDto {
    questionId: string;
    stringValue?: string;
    integerValue?: number;
    booleanValue?: boolean;
  }
  
  export interface AnswerForUpdateDto {
    id: string;
    stringValue?: string;
    integerValue?: number;
    booleanValue?: boolean;
  }
  
  export interface FormForSubmissionDto {
    answers: AnswerForCreationDto[];
  }
  
  export interface FormForUpdateDto {
    answers: AnswerForUpdateDto[];
  }

  export interface AuthResponseDto {
    accessToken: string;
    refreshToken: string;
  }

  export interface UserPreferencesDto {
    prefLang: string;
    prefTheme: string;
  }

  export interface MetaData {
    CurrentPage: number;
    TotalPages: number;
    PageSize: number;
    TotalCount: number;
    HasPrevious: boolean;
    HasNext: boolean;
  }

  export interface SalesforceProfileFormDto {
    companyName: string;
    website?: string;
    industry?: string;
    description?: string;
    companyPhone?: string;
    
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    title?: string;
  }
  
  export interface SalesforceProfileInfo {
    exists: boolean;
    accountId?: string;
    contactId?: string;
    createdAt?: string;
  }

  export interface SupportTicketDto {
  summary: string;
  priority: string;
  link: string;
}