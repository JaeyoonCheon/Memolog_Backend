PGDMP                 	        {            Memolog     15.1 (Ubuntu 15.1-1.pgdg22.04+1)    15.1                0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false                       0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            	           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            
           1262    16388    Memolog    DATABASE     q   CREATE DATABASE "Memolog" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C.UTF-8';
    DROP DATABASE "Memolog";
                postgres    false            �            1259    16394    document    TABLE     �   CREATE TABLE public.document (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    form text NOT NULL,
    created_at date NOT NULL,
    updated_at date NOT NULL,
    user_id integer NOT NULL
);
    DROP TABLE public.document;
       public         heap    postgres    false            �            1259    16406    document_id_seq    SEQUENCE     �   ALTER TABLE public.document ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.document_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          postgres    false    215            �            1259    16389    user    TABLE     )  CREATE TABLE public."user" (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    email character varying(100) NOT NULL,
    profile_image character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at date NOT NULL,
    updated_at date NOT NULL
);
    DROP TABLE public."user";
       public         heap    postgres    false            �            1259    16405    user_id_seq    SEQUENCE     �   ALTER TABLE public."user" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
            public          postgres    false    214                      0    16394    document 
   TABLE DATA                 public          postgres    false    215   9                 0    16389    user 
   TABLE DATA                 public          postgres    false    214   S                  0    0    document_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.document_id_seq', 1, false);
          public          postgres    false    217                       0    0    user_id_seq    SEQUENCE SET     9   SELECT pg_catalog.setval('public.user_id_seq', 3, true);
          public          postgres    false    216            r           2606    16408    document document_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.document
    ADD CONSTRAINT document_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.document DROP CONSTRAINT document_pkey;
       public            postgres    false    215            p           2606    16400    user user_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public."user" DROP CONSTRAINT user_pkey;
       public            postgres    false    214               
   x���             �   x�]�A�0��~�?]T�2�Kt)hĠԄN2u����&}�����~<x4-H^M����7��z��<���db@�����d�l3�5�y�j�,�jfL���YE�hz��^��
��r#k�%\ˍ�G���0lG�؆Ѯ�����0����1�� ���5�8��BB�     