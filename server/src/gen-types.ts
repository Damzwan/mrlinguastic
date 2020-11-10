import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};










export type AdditionalEntityFields = {
  path?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

export enum Collections {
  Users = 'Users',
  Voclists = 'Voclists',
  Groups = 'Groups'
}

export type Group = {
  __typename?: 'Group';
  _id: Scalars['ID'];
  name: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  members?: Maybe<Array<User>>;
  voclists?: Maybe<Array<Voclist>>;
};

export type GroupInput = {
  name: Scalars['String'];
  description: Scalars['String'];
};

export type LangSettings = {
  __typename?: 'LangSettings';
  fromLang: Scalars['String'];
  toLang: Scalars['String'];
  toVoice: Scalars['String'];
};

export type LangSettingsInput = {
  fromLang: Scalars['String'];
  toLang: Scalars['String'];
  toVoice: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  updateVoclist?: Maybe<Scalars['Boolean']>;
  addSharedVoclist?: Maybe<Scalars['Boolean']>;
  deleteVoclist?: Maybe<Scalars['Boolean']>;
  saveImg: Scalars['String'];
  removeImgs?: Maybe<Scalars['Boolean']>;
  createGroup?: Maybe<Scalars['String']>;
  addVoclistToGroup?: Maybe<Scalars['Boolean']>;
  removeVoclistFromGroup?: Maybe<Scalars['Boolean']>;
  addUserToGroup?: Maybe<Scalars['String']>;
  removeUserFromGroup?: Maybe<Scalars['Boolean']>;
  copyVoclist?: Maybe<Voclist>;
};


export type MutationUpdateVoclistArgs = {
  list: VoclistInput;
  changedBlobs?: Maybe<Array<Scalars['String']>>;
  oid: Scalars['String'];
};


export type MutationAddSharedVoclistArgs = {
  userId: Scalars['String'];
  vocId: Scalars['String'];
};


export type MutationDeleteVoclistArgs = {
  userId: Scalars['String'];
  vocId: Scalars['String'];
  blobs: Array<Maybe<Scalars['String']>>;
};


export type MutationSaveImgArgs = {
  img: Scalars['String'];
};


export type MutationRemoveImgsArgs = {
  imgs?: Maybe<Array<Scalars['String']>>;
};


export type MutationCreateGroupArgs = {
  groupInfo: GroupInput;
  userId: Scalars['String'];
};


export type MutationAddVoclistToGroupArgs = {
  groupId: Scalars['String'];
  vocId: Scalars['String'];
};


export type MutationRemoveVoclistFromGroupArgs = {
  groupId: Scalars['String'];
  vocId: Scalars['String'];
};


export type MutationAddUserToGroupArgs = {
  userId: Scalars['String'];
  groupId: Scalars['String'];
};


export type MutationRemoveUserFromGroupArgs = {
  userId: Scalars['String'];
  groupId: Scalars['String'];
};


export type MutationCopyVoclistArgs = {
  voclistId: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  user?: Maybe<User>;
  translateWord?: Maybe<Array<Maybe<Scalars['String']>>>;
  translateWords?: Maybe<Array<Maybe<Scalars['String']>>>;
  voclist?: Maybe<Voclist>;
  group?: Maybe<Group>;
  getImages?: Maybe<Array<Scalars['String']>>;
  getVoices?: Maybe<Array<Maybe<Voice>>>;
  getExamples?: Maybe<Array<Sentence>>;
};


export type QueryUserArgs = {
  oid: Scalars['String'];
};


export type QueryTranslateWordArgs = {
  word: Scalars['String'];
  fromLang: Scalars['String'];
  toLang: Scalars['String'];
};


export type QueryTranslateWordsArgs = {
  words?: Maybe<Array<Scalars['String']>>;
  fromLang: Scalars['String'];
  toLang: Scalars['String'];
};


export type QueryVoclistArgs = {
  voclistId: Scalars['String'];
};


export type QueryGroupArgs = {
  groupId: Scalars['String'];
};


export type QueryGetImagesArgs = {
  word: Scalars['String'];
  lang: Scalars['String'];
};


export type QueryGetExamplesArgs = {
  from: Scalars['String'];
  to?: Maybe<Scalars['String']>;
  fromLang: Scalars['String'];
  toLang: Scalars['String'];
};

export type Sentence = {
  __typename?: 'Sentence';
  from: Scalars['String'];
  to?: Maybe<Array<Scalars['String']>>;
};

export type SentenceInput = {
  from: Scalars['String'];
  to?: Maybe<Array<Scalars['String']>>;
};

export type User = {
  __typename?: 'User';
  _id: Scalars['ID'];
  voclists?: Maybe<Array<Voclist>>;
  groups?: Maybe<Array<Group>>;
};

export type UserInput = {
  username: Scalars['String'];
};

export type Voclist = {
  __typename?: 'Voclist';
  _id: Scalars['ID'];
  settings?: Maybe<VoclistSettings>;
  words?: Maybe<Array<Word>>;
  creator?: Maybe<Scalars['String']>;
  lastEdited?: Maybe<Scalars['String']>;
};

export type VoclistInput = {
  _id: Scalars['ID'];
  settings: VoclistSettingsInput;
  words?: Maybe<Array<WordInput>>;
  creator?: Maybe<Scalars['String']>;
  lastEdited?: Maybe<Scalars['String']>;
};

export type VoclistSettings = {
  __typename?: 'VoclistSettings';
  title: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  langSettings: LangSettings;
};

export type VoclistSettingsInput = {
  title: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  langSettings: LangSettingsInput;
};

export type Voice = {
  __typename?: 'Voice';
  DisplayName?: Maybe<Scalars['String']>;
  Gender?: Maybe<Scalars['String']>;
  ShortName?: Maybe<Scalars['String']>;
};

export type Word = {
  __typename?: 'Word';
  from: Scalars['String'];
  to: Scalars['String'];
  img?: Maybe<Scalars['String']>;
  toAudio?: Maybe<Scalars['String']>;
  sentences?: Maybe<Array<Sentence>>;
};

export type WordInput = {
  from: Scalars['String'];
  to: Scalars['String'];
  img?: Maybe<Scalars['String']>;
  toAudio?: Maybe<Scalars['String']>;
  sentences?: Maybe<Array<SentenceInput>>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}> = (obj: T, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  User: ResolverTypeWrapper<UserDbObject>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Voclist: ResolverTypeWrapper<VoclistDbObject>;
  VoclistSettings: ResolverTypeWrapper<VoclistSettings>;
  LangSettings: ResolverTypeWrapper<LangSettings>;
  Word: ResolverTypeWrapper<Word>;
  Sentence: ResolverTypeWrapper<Sentence>;
  Group: ResolverTypeWrapper<GroupDbObject>;
  Voice: ResolverTypeWrapper<Voice>;
  Mutation: ResolverTypeWrapper<{}>;
  VoclistInput: VoclistInput;
  VoclistSettingsInput: VoclistSettingsInput;
  LangSettingsInput: LangSettingsInput;
  WordInput: WordInput;
  SentenceInput: SentenceInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  GroupInput: GroupInput;
  AdditionalEntityFields: AdditionalEntityFields;
  CacheControlScope: CacheControlScope;
  Collections: Collections;
  UserInput: UserInput;
  Int: ResolverTypeWrapper<Scalars['Int']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {};
  String: Scalars['String'];
  User: UserDbObject;
  ID: Scalars['ID'];
  Voclist: VoclistDbObject;
  VoclistSettings: VoclistSettings;
  LangSettings: LangSettings;
  Word: Word;
  Sentence: Sentence;
  Group: GroupDbObject;
  Voice: Voice;
  Mutation: {};
  VoclistInput: VoclistInput;
  VoclistSettingsInput: VoclistSettingsInput;
  LangSettingsInput: LangSettingsInput;
  WordInput: WordInput;
  SentenceInput: SentenceInput;
  Boolean: Scalars['Boolean'];
  GroupInput: GroupInput;
  AdditionalEntityFields: AdditionalEntityFields;
  UserInput: UserInput;
  Int: Scalars['Int'];
};

export type UnionDirectiveArgs = {   discriminatorField?: Maybe<Scalars['String']>;
  additionalFields?: Maybe<Array<Maybe<AdditionalEntityFields>>>; };

export type UnionDirectiveResolver<Result, Parent, ContextType = any, Args = UnionDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AbstractEntityDirectiveArgs = {   discriminatorField: Scalars['String'];
  additionalFields?: Maybe<Array<Maybe<AdditionalEntityFields>>>; };

export type AbstractEntityDirectiveResolver<Result, Parent, ContextType = any, Args = AbstractEntityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type EntityDirectiveArgs = {   embedded?: Maybe<Scalars['Boolean']>;
  additionalFields?: Maybe<Array<Maybe<AdditionalEntityFields>>>; };

export type EntityDirectiveResolver<Result, Parent, ContextType = any, Args = EntityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ColumnDirectiveArgs = {   overrideType?: Maybe<Scalars['String']>; };

export type ColumnDirectiveResolver<Result, Parent, ContextType = any, Args = ColumnDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type IdDirectiveArgs = {  };

export type IdDirectiveResolver<Result, Parent, ContextType = any, Args = IdDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type LinkDirectiveArgs = {   overrideType?: Maybe<Scalars['String']>; };

export type LinkDirectiveResolver<Result, Parent, ContextType = any, Args = LinkDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type EmbeddedDirectiveArgs = {  };

export type EmbeddedDirectiveResolver<Result, Parent, ContextType = any, Args = EmbeddedDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type MapDirectiveArgs = {   path: Scalars['String']; };

export type MapDirectiveResolver<Result, Parent, ContextType = any, Args = MapDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type CacheControlDirectiveArgs = {   maxAge?: Maybe<Scalars['Int']>;
  scope?: Maybe<CacheControlScope>; };

export type CacheControlDirectiveResolver<Result, Parent, ContextType = any, Args = CacheControlDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type GroupResolvers<ContextType = any, ParentType extends ResolversParentTypes['Group'] = ResolversParentTypes['Group']> = {
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  members?: Resolver<Maybe<Array<ResolversTypes['User']>>, ParentType, ContextType>;
  voclists?: Resolver<Maybe<Array<ResolversTypes['Voclist']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type LangSettingsResolvers<ContextType = any, ParentType extends ResolversParentTypes['LangSettings'] = ResolversParentTypes['LangSettings']> = {
  fromLang?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  toLang?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  toVoice?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  updateVoclist?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationUpdateVoclistArgs, 'list' | 'oid'>>;
  addSharedVoclist?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationAddSharedVoclistArgs, 'userId' | 'vocId'>>;
  deleteVoclist?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationDeleteVoclistArgs, 'userId' | 'vocId' | 'blobs'>>;
  saveImg?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationSaveImgArgs, 'img'>>;
  removeImgs?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRemoveImgsArgs, never>>;
  createGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationCreateGroupArgs, 'groupInfo' | 'userId'>>;
  addVoclistToGroup?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationAddVoclistToGroupArgs, 'groupId' | 'vocId'>>;
  removeVoclistFromGroup?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRemoveVoclistFromGroupArgs, 'groupId' | 'vocId'>>;
  addUserToGroup?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType, RequireFields<MutationAddUserToGroupArgs, 'userId' | 'groupId'>>;
  removeUserFromGroup?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<MutationRemoveUserFromGroupArgs, 'userId' | 'groupId'>>;
  copyVoclist?: Resolver<Maybe<ResolversTypes['Voclist']>, ParentType, ContextType, RequireFields<MutationCopyVoclistArgs, 'voclistId'>>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'oid'>>;
  translateWord?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType, RequireFields<QueryTranslateWordArgs, 'word' | 'fromLang' | 'toLang'>>;
  translateWords?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType, RequireFields<QueryTranslateWordsArgs, 'fromLang' | 'toLang'>>;
  voclist?: Resolver<Maybe<ResolversTypes['Voclist']>, ParentType, ContextType, RequireFields<QueryVoclistArgs, 'voclistId'>>;
  group?: Resolver<Maybe<ResolversTypes['Group']>, ParentType, ContextType, RequireFields<QueryGroupArgs, 'groupId'>>;
  getImages?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType, RequireFields<QueryGetImagesArgs, 'word' | 'lang'>>;
  getVoices?: Resolver<Maybe<Array<Maybe<ResolversTypes['Voice']>>>, ParentType, ContextType>;
  getExamples?: Resolver<Maybe<Array<ResolversTypes['Sentence']>>, ParentType, ContextType, RequireFields<QueryGetExamplesArgs, 'from' | 'fromLang' | 'toLang'>>;
};

export type SentenceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Sentence'] = ResolversParentTypes['Sentence']> = {
  from?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  to?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  voclists?: Resolver<Maybe<Array<ResolversTypes['Voclist']>>, ParentType, ContextType>;
  groups?: Resolver<Maybe<Array<ResolversTypes['Group']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type VoclistResolvers<ContextType = any, ParentType extends ResolversParentTypes['Voclist'] = ResolversParentTypes['Voclist']> = {
  _id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  settings?: Resolver<Maybe<ResolversTypes['VoclistSettings']>, ParentType, ContextType>;
  words?: Resolver<Maybe<Array<ResolversTypes['Word']>>, ParentType, ContextType>;
  creator?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  lastEdited?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type VoclistSettingsResolvers<ContextType = any, ParentType extends ResolversParentTypes['VoclistSettings'] = ResolversParentTypes['VoclistSettings']> = {
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  langSettings?: Resolver<ResolversTypes['LangSettings'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type VoiceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Voice'] = ResolversParentTypes['Voice']> = {
  DisplayName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Gender?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ShortName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type WordResolvers<ContextType = any, ParentType extends ResolversParentTypes['Word'] = ResolversParentTypes['Word']> = {
  from?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  to?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  img?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  toAudio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sentences?: Resolver<Maybe<Array<ResolversTypes['Sentence']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type Resolvers<ContextType = any> = {
  Group?: GroupResolvers<ContextType>;
  LangSettings?: LangSettingsResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Sentence?: SentenceResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  Voclist?: VoclistResolvers<ContextType>;
  VoclistSettings?: VoclistSettingsResolvers<ContextType>;
  Voice?: VoiceResolvers<ContextType>;
  Word?: WordResolvers<ContextType>;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
export type DirectiveResolvers<ContextType = any> = {
  union?: UnionDirectiveResolver<any, any, ContextType>;
  abstractEntity?: AbstractEntityDirectiveResolver<any, any, ContextType>;
  entity?: EntityDirectiveResolver<any, any, ContextType>;
  column?: ColumnDirectiveResolver<any, any, ContextType>;
  id?: IdDirectiveResolver<any, any, ContextType>;
  link?: LinkDirectiveResolver<any, any, ContextType>;
  embedded?: EmbeddedDirectiveResolver<any, any, ContextType>;
  map?: MapDirectiveResolver<any, any, ContextType>;
  cacheControl?: CacheControlDirectiveResolver<any, any, ContextType>;
};


/**
 * @deprecated
 * Use "DirectiveResolvers" root object instead. If you wish to get "IDirectiveResolvers", add "typesPrefix: I" to your config.
 */
export type IDirectiveResolvers<ContextType = any> = DirectiveResolvers<ContextType>;

export type UserDbObject = {
  _id: string,
  voclists?: Maybe<Array<VoclistDbObject['_id']>>,
  groups?: Maybe<Array<GroupDbObject['_id']>>,
};

export type VoclistDbObject = {
  _id: string,
  settings?: Maybe<VoclistSettingsDbObject>,
  words?: Maybe<Array<WordDbObject>>,
  creator?: Maybe<string>,
  lastEdited?: Maybe<string>,
};

export type VoclistSettingsDbObject = {
  title: string,
  description?: Maybe<string>,
  langSettings: LangSettingsDbObject,
};

export type LangSettingsDbObject = {
  fromLang: string,
  toLang: string,
  toVoice: string,
};

export type WordDbObject = {
  from: string,
  to: string,
  img?: Maybe<string>,
  toAudio?: Maybe<string>,
  sentences?: Maybe<Array<SentenceDbObject>>,
};

export type SentenceDbObject = {
  from: string,
  to?: Maybe<Array<string>>,
};

export type GroupDbObject = {
  _id: string,
  name: string,
  description?: Maybe<string>,
  members?: Maybe<Array<UserDbObject['_id']>>,
  voclists?: Maybe<Array<VoclistDbObject['_id']>>,
};

