/*
 Roles has names and each role has a restriction of what
 the role can modify/create/access:

 Like accessing files on a unix-system, the restrictions are set like:
 |GALLERY| IMAGE | USERS |
 | R W X | R W   | R W   | => 7-bits in total

 R = Read
 W = Write / Upload
 X = Whether or not allowed to publish
 */
export const Restrictions = {
  READ_GALLERY      : 0x40,
  WRITE_GALLERY     : 0x20,
  PUBLISH_GALLERY   : 0x10,
  READ_IMAGES       : 0x08,
  WRITE_IMAGES      : 0x04,
  READ_USERS        : 0x02,
  WRITE_USERS       : 0x01
};

export const UserRoles = [
  // Admin is allowed to do everything
  {
    name: 'Admin',
    restrictions: (
      Restrictions.READ_GALLERY
      | Restrictions.WRITE_GALLERY
      | Restrictions.PUBLISH_GALLERY
      | Restrictions.READ_IMAGES
      | Restrictions.WRITE_IMAGES
      | Restrictions.READ_USERS
      | Restrictions.WRITE_USERS
    )
  },

  // DFotoMember can do everything but access other users
  {
    name: 'DFoto',
    restrictions: (
      Restrictions.READ_GALLERY
      | Restrictions.WRITE_GALLERY
      | Restrictions.PUBLISH_GALLERY
      | Restrictions.READ_IMAGES
      | Restrictions.WRITE_IMAGES
      | Restrictions.READ_USERS
    )
  },

  // Aspirant can only upload images to already existing galleries
  {
    name: 'Aspirant',
    restrictions: (
      Restrictions.READ_GALLERY
      | Restrictions.READ_IMAGES
      | Restrictions.WRITE_IMAGES
    )
  },

  // Default role for demotion (can read images+galleries)
  {
    name: 'None',
    restrictions: (
      Restrictions.READ_GALLERY
      | Restrictions.READ_IMAGES
    )
  }
];

